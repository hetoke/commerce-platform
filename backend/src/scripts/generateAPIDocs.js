import fs from "fs";
import path from "path";
import { globSync } from "glob";
import { spawn } from "child_process";

const ROUTES_DIR = "./src/routes";
const CONTROLLERS_DIR = "./src/controllers";
const SERVICES_DIR = "./src/services";
const SCHEMAS_DIR = "./src/config/schemas";

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

function readSchemas() {
  const files = globSync(`${SCHEMAS_DIR}/**/*.js`);
  let content = "";
  for (const file of files) {
    content += fs.readFileSync(file, "utf8") + "\n";
  }
  return content;
}

// ─── Controller / Service Finders ────────────────────────────────────────────

function findRelatedControllers(routeContent, controllers) {
  let result = "";
  for (const [, { content }] of Object.entries(controllers)) {
    // Include controller file if any of its exports are referenced in the route
    const exportMatches = content.match(/export const (\w+)/g) || [];
    for (const match of exportMatches) {
      const name = match.replace("export const ", "");
      if (routeContent.includes(name)) {
        result += content + "\n";
        break;
      }
    }
  }
  return result;
}

function findRelatedServices(controllerCode, services) {
  let result = "";
  for (const [file, { content }] of Object.entries(services)) {
    const name = file.replace(".js", "");
    if (controllerCode.includes(name)) {
      result += content + "\n";
    }
  }
  return result;
}

// ─── Prompt Builder ──────────────────────────────────────────────────────────

function buildPrompt(routeContent, controllerCode, serviceCode, schemaCode) {
  return `You are a Swagger documentation expert. Your job is to return the SAME route file with @swagger JSDoc blocks added above each route.

STRICT RULES:
- Return the COMPLETE file content, unchanged except for added @swagger blocks
- Do NOT change any logic, imports, exports, or existing comments
- Do NOT remove anything from the original file
- Add a /** @swagger ... */ block directly above EVERY router.METHOD(...) call
- Each @swagger block must start with: summary:
- Use $ref to reference schemas where appropriate
- No markdown fences, no explanations — output ONLY the raw file content
- Follow the EXACT path format: "/path:" followed by HTTP method

SWAGGER BLOCK FORMAT (place directly above each route, no blank line between block and route):
/**
 * @swagger
 * /api/path:
 *   get:
 *     summary: Brief description
 *     tags:
 *       - TagName
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchemaName'
 *       '400':
 *         description: Validation error
 *       '404':
 *         description: Not found
 *       '500':
 *         description: Internal server error
 */

Additional guidelines:
- Include security requirements for protected routes
- Add request bodies for POST/PUT operations
- Reference appropriate schemas from the provided list
- Use proper HTTP status codes and descriptions
- Include middleware effects in descriptions where relevant

ROUTE FILE TO DOCUMENT:
${routeContent}

RELATED CONTROLLER CODE:
${controllerCode}

RELATED SERVICE CODE:
${serviceCode}

AVAILABLE SCHEMAS:
${schemaCode}`;
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

// ─── Backup ──────────────────────────────────────────────────────────────────

function backupFile(filePath) {
  const backupPath = filePath + ".bak";
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(filePath, backupPath);
    console.log("  ✔ Backup created:", backupPath);
  }
}

// ─── Main Processor ──────────────────────────────────────────────────────────

async function processRoutes(routeFiles, controllers, services, schemaCode) {
  const total = Object.keys(routeFiles).length;
  let processed = 0;
  let failed = 0;

  for (const [fileName, { content, fullPath }] of Object.entries(routeFiles)) {
    console.log(`\n[${processed + failed + 1}/${total}] File: ${fileName}`);

    const controllerCode = findRelatedControllers(content, controllers);
    const serviceCode = findRelatedServices(controllerCode, services);
    const prompt = buildPrompt(content, controllerCode, serviceCode, schemaCode);

    try {
      const documented = await callLLM(prompt);

      backupFile(fullPath);
      fs.writeFileSync(fullPath, documented);

      console.log("  ✔ Done.");
      processed++;
    } catch (err) {
      console.error(`  ✖ Failed: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n─────────────────────────────────`);
  console.log(`Files processed : ${processed}/${total}`);
  console.log(`Files failed    : ${failed}`);
  console.log(`─────────────────────────────────`);
}

// ─── Entry Point ─────────────────────────────────────────────────────────────

async function main() {
  console.log("Reading files...");

  const routes = readFiles(ROUTES_DIR);
  const controllers = readFiles(CONTROLLERS_DIR);
  const services = readFiles(SERVICES_DIR);
  const schemas = readSchemas();

  console.log(
    `Found: ${Object.keys(routes).length} route files, ` +
    `${Object.keys(controllers).length} controllers, ` +
    `${Object.keys(services).length} services`
  );

  console.log("\nGenerating API docs...\n");

  await processRoutes(routes, controllers, services, schemas);

  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});