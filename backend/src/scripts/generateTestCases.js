import fs from "fs";
import path from "path";
import { globSync } from "glob";
import { spawn } from "child_process";

const ROUTES_DIR = "../routes";
const OUTPUT_DIR = "../__tests__/availability";
const APP_PATH = "../server.js"; // path to your Express app export
const LOGIN_URL = "/auth/login"; // adjust to your login endpoint

const MODEL = "qwen3-coder:480b-cloud";

// ─── File Readers ────────────────────────────────────────────────────────────

function readFiles(dir) {
  const files = globSync(`${dir}/**/*.js`);
  const result = {};
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    result[path.basename(file)] = { content, fullPath: file };
  }
  return result;
}

// ─── Prompt Builder ──────────────────────────────────────────────────────────

function buildPrompt(routeContent) {
  return `You are a Jest test generator. Given a route file with @swagger JSDoc blocks, generate a Jest test file using supertest.

STRICT RULES:
- Output ONLY raw JavaScript, no markdown fences, no explanations
- Tests focus ONLY on error cases: 400 (validation errors) and 500 (server errors)
- Use supertest with the Express app imported from '${APP_PATH}'
- Auth token is obtained ONCE in a beforeAll() block via POST to '${LOGIN_URL}'
  using credentials from process.env.TEST_EMAIL and process.env.TEST_PASSWORD
- Use the token in Authorization: Bearer header for protected routes
- For 400 tests: send intentionally malformed or missing required fields
- For 500 tests: only include if the route is likely to have a 500 case documented
- Group tests per route in describe() blocks named by METHOD + path
- Each test must have a clear description of what bad input is being sent
- Import supertest as: import request from 'supertest'
- Import app as: import app from '${APP_PATH}'

TEST FILE STRUCTURE EXAMPLE:
import request from 'supertest';
import app from '${APP_PATH}';

describe('POST /users', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('${LOGIN_URL}')
      .send({ email: process.env.TEST_EMAIL, password: process.env.TEST_PASSWORD });
    token = res.body.token;
  });

  it('returns 400 when email is missing', async () => {
    const res = await request(app)
      .post('/users')
      .set('Authorization', \`Bearer \${token}\`)
      .send({ name: 'Test' }); // missing email
    expect(res.status).toBe(400);
  });
});

ROUTE FILE:
${routeContent}`;
}

// ─── LLM Caller ──────────────────────────────────────────────────────────────

function callLLM(prompt) {
  return new Promise((resolve, reject) => {
    const proc = spawn("ollama", ["run", MODEL, "--nowordwrap"]);

    let output = "";
    let errorOutput = "";

    proc.stdout.on("data", (data) => { output += data.toString(); });
    proc.stderr.on("data", (data) => { errorOutput += data.toString(); });

    proc.on("close", (code) => {
      if (code !== 0) {
        console.error("LLM error:", errorOutput);
        return reject(new Error("Ollama process failed"));
      }

      const cleaned = output
        .replace(/<think>[\s\S]*?<\/think>/gi, "")  // Strip Qwen3 thinking tokens
        .replace(/^```[a-z]*\n?/gm, "")             // Strip opening markdown fences
        .replace(/^```\s*$/gm, "")                  // Strip closing markdown fences
        .trim();

      resolve(cleaned);
    });

    proc.stdin.write(prompt);
    proc.stdin.end();
  });
}

// ─── Writer ──────────────────────────────────────────────────────────────────

function writeTestFile(fileName, testCode) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const testFileName = fileName.replace(".js", ".test.js");
  const outPath = path.join(OUTPUT_DIR, testFileName);

  fs.writeFileSync(outPath, testCode);
  console.log("  ✔ Written:", outPath);
}

// ─── Main Processor ──────────────────────────────────────────────────────────

async function processRoutes(routeFiles) {
  const total = Object.keys(routeFiles).length;
  let processed = 0;
  let failed = 0;

  for (const [fileName, { content }] of Object.entries(routeFiles)) {
    console.log(`\n[${processed + failed + 1}/${total}] File: ${fileName}`);

    // Skip route files with no @swagger blocks — nothing to generate tests from
    if (!content.includes("@swagger")) {
      console.log("  ⚠ No @swagger blocks found, skipping.");
      continue;
    }

    const prompt = buildPrompt(content);

    try {
      const testCode = await callLLM(prompt);
      writeTestFile(fileName, testCode);
      processed++;
    } catch (err) {
      console.error(`  ✖ Failed: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n─────────────────────────────────`);
  console.log(`Test files generated : ${processed}/${total}`);
  console.log(`Failed               : ${failed}`);
  console.log(`─────────────────────────────────`);
  console.log(`\nRun tests with:`);
  console.log(`  TEST_EMAIL=you@example.com TEST_PASSWORD=secret npx jest __tests__/availability`);
}

// ─── Entry Point ─────────────────────────────────────────────────────────────

async function main() {
  console.log("Reading route files...");

  const routes = readFiles(ROUTES_DIR);

  console.log(`Found: ${Object.keys(routes).length} route files`);
  console.log("\nGenerating test files...\n");

  await processRoutes(routes);

  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});