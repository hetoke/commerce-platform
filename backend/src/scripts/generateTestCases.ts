// @ts-nocheck
import fs from "fs";
import path from "path";
import { globSync } from "glob";
import { spawn } from "child_process";

const ROUTES_DIR = "./src/routes";
const OUTPUT_DIR = "./src/__tests__/availability";
const APP_PATH = "../../app.js";
const LOGIN_URL = "/api/auth/login"; // adjust to your login endpoint

const MODEL = "qwen3-coder:480b-cloud";

// ─── File Readers ────────────────────────────────────────────────────────────

function readFiles(dir) {
  const files = globSync(`${dir}/**/*.ts`);
  const result = {};
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    result[path.basename(file)] = { content, fullPath: file };
  }
  return result;
}

function readExistingTest(fileName) {
  const testFileName = fileName.replace(".ts", ".test.ts");
  const testPath = path.join(OUTPUT_DIR, testFileName);

  if (fs.existsSync(testPath)) {
    return fs.readFileSync(testPath, "utf8");
  }

  return null;
}

// ─── Prompt Builder ──────────────────────────────────────────────────────────

function buildPrompt(routeContent, existingTestContent = null) {
  let basePrompt = `You are a Vitest test generator.
Your task is to generate a Vitest test file using supertest for the given Express route file containing @swagger JSDoc blocks.

STRICT RULES:
* Output ONLY raw JavaScript code
* Do NOT output markdown fences
* Do NOT include explanations
* Do NOT include comments except minimal inline test descriptions
* Tests must focus ONLY on error cases (HTTP 400 validation errors and HTTP 500 server errors)

AUTHENTICATION RULES:
* Some routes require authentication.
* Create a persistent supertest agent using: const agent = request.agent(app)
* Perform login ONCE in a beforeAll() block using:
await agent.post('${LOGIN_URL}').send({ identifier: 'bob', password: 'customer123' })
* The test database is seeded with deterministic users:
  - Admin user: identifier: 'admin' password: 'admin123'
  - Normal user: identifier: 'bob' password: 'customer123'
* Use the normal user (bob) for authentication unless the route clearly requires admin privileges.

SESSION RULES:
* The API uses cookie-based authentication.
* Because of this, ALWAYS perform authenticated requests using the same agent instance.
* Do NOT manually set Authorization headers.
* Do NOT assume the login endpoint returns a token.

TEST GENERATION RULES:
* Only generate tests that trigger:
  * HTTP 400 (validation errors)
  * HTTP 500 (server errors)
* Do NOT generate tests expecting:
  * 200
  * 201
  * success responses
* Do NOT generate:
  * 401
  * 403

VALIDATION TEST STRATEGY:
Generate tests that send invalid inputs such as:
* Missing required fields
* Fields with invalid types
* Fields that are too short
* Fields that violate regex or character rules
* Malformed request bodies
* Invalid parameters

STRUCTURE RULES:
* Import vitest globals as: import { describe, it, expect, beforeAll } from 'vitest'
* Import supertest as: import request from 'supertest'
* Import the Express app from: import app from '${APP_PATH}'

TEST FILE STRUCTURE:
\`\`\`
import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '${APP_PATH}'

describe('METHOD /route/path', () => {
  const agent = request.agent(app)

  beforeAll(async () => {
    await agent.post('${LOGIN_URL}').send({ identifier: 'bob', password: 'customer123' })
  })

  it('returns 400 when requiredField is missing', async () => {
    const res = await agent
      .post('/route/path')
      .send({})

    expect(res.status).toBe(400)
  })
})
\`\`\`

GROUPING RULES:
- Each route that has generated tests must have its own describe() block.
- Name describe blocks using "METHOD /route/path".

EMPTY SUITE RULE:
- If no tests can be generated for a route, do NOT generate a describe() block for that route.
- A describe() block must NEVER be empty.
- Every describe() block must contain at least one it() test.

MOCKING RULES:
* Do NOT modify imported modules directly
* ES modules are immutable
* If a test requires forcing a server error, use vi.mock()
* vi.mock must appear before importing the Express app

PARAMETER RULES:
* If a route requires path parameters (e.g. /items/{id}), generate invalid parameter tests such as:
  * malformed IDs
  * missing parameters
  * invalid formats

STATUS CODE RULES:
* Do not assume status codes
* If the Swagger documentation defines response codes, follow them exactly
* If Swagger does not define a response code, only generate 400 validation tests

IMPORTANT:
* Always send malformed or incomplete payloads to trigger validation failures
* Keep tests simple and focused on the HTTP status code
* DO NOT generate 500 tests unless the Swagger spec explicitly documents them

ROUTE FILE:
${routeContent}`;

  if (existingTestContent) {
    basePrompt += `\n\nEXISTING TEST FILE:\n${existingTestContent}\n\nRULE: Only append NEW test cases to the EXISTING structure above. Preserve all imports, structure, and formatting.`;
  }

  return basePrompt
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

  const testFileName = fileName.replace(".ts", ".test.ts");
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

    const existingTestContent = readExistingTest(fileName);
    const prompt = buildPrompt(content, existingTestContent);

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
  console.log(`  npm test`);
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
