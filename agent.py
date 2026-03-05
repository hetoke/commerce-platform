import json
import shutil
from pathlib import Path
from difflib import unified_diff

from langchain_core.prompts import PromptTemplate
from langchain_community.chat_models import ChatOllama

# ------------------------
# CONFIGURATION
# ------------------------
DRY_RUN = False  # Set to False to write changes

# Model
llm = ChatOllama(
    model="gpt-oss:120b-cloud",
    temperature=0,
    timeout=180, 
)

# Paths
controllers_path = Path("./backend/src/controllers")
routes_path = Path("./backend/src/routes")
schemas_path = Path("./backend/src/config/schemas")
swagger_config_path = Path("./backend/src/config/swagger.js")

# ------------------------
# Read controllers
# ------------------------
controllers_code = ""
for file_path in controllers_path.glob("*.js"):
    controllers_code += file_path.read_text(encoding="utf-8") + "\n\n"

# ------------------------
# Read existing schemas
# ------------------------
schemas_code = ""
existing_schemas = {}
for file_path in schemas_path.glob("*.js"):
    content = file_path.read_text(encoding="utf-8")
    schemas_code += content + "\n\n"
    existing_schemas[file_path.name] = content

# ------------------------
# Read Swagger config
# ------------------------
swagger_config = swagger_config_path.read_text(encoding="utf-8")

# ------------------------
# Prompt Template
# ------------------------
prompt = PromptTemplate.from_template("""
You are a senior Node.js/Express engineer and API doc expert.

Project structure:
- controllers contain business logic
- routes contain Express endpoints
- schemas define OpenAPI components in /config/schemas
- swagger.js contains global Swagger configuration

Controllers:
{controllers_code}

Schemas:
{schemas_code}

Swagger config:
{swagger_config}

Route file:
{route_code}

Task:
1. Inject Swagger JSDoc comments above each route based on the controller functions they call.
2. Update existing schemas or add new ones to /config/schemas if needed.
3. Use proper $ref in routes; do NOT redefine schemas inline.
4. Keep existing code unchanged.
5. Only add or update schemas if missing or incomplete.
6. Do not modify unrelated code.
7. If unsure, return code as-is instead of risky changes.
8. Return a JSON object with two keys:
   - "updated_route": full updated route file as string
   - "updated_schemas": a dict mapping schema filenames to their updated content
""")

# ------------------------
# Pipeline
# ------------------------
chain = prompt | llm

# ------------------------
# Process each route
# ------------------------
for route_file in routes_path.glob("*.js"):
    print(f"Processing {route_file}...")

    # Backup route
    shutil.copy(route_file, route_file.with_suffix(".js.bak"))

    route_code = route_file.read_text(encoding="utf-8")

    # LLM call
    response = chain.invoke({
        "route_code": route_code,
        "controllers_code": controllers_code,
        "schemas_code": schemas_code,
        "swagger_config": swagger_config
    })

    # Validate JSON
    try:
        result = json.loads(response.content)
    except json.JSONDecodeError:
        print(f"⚠️ LLM returned invalid JSON for {route_file}. Skipping.")
        continue

    updated_route = result.get("updated_route", route_code)
    updated_schemas = result.get("updated_schemas", {})

    # ------------------------
    # Diff & write route
    # ------------------------
    diff = "\n".join(unified_diff(
        route_code.splitlines(),
        updated_route.splitlines(),
        fromfile=str(route_file),
        tofile="updated",
        lineterm=""
    ))

    if diff:
        print(f"Changes for {route_file}:\n{diff}\n")
        if not DRY_RUN:
            route_file.write_text(updated_route, encoding="utf-8")
            print(f"✅ Route updated: {route_file}")
    else:
        print(f"No changes for {route_file}")

    # ------------------------
    # Write/update schema files
    # ------------------------
    for filename, content in updated_schemas.items():
        schema_file = schemas_path / filename

        # Backup existing file if exists
        if schema_file.exists():
            shutil.copy(schema_file, schema_file.with_suffix(".js.bak"))

        # Write the schema file (new or updated)
        if not DRY_RUN:
            schema_file.write_text(content, encoding="utf-8")
            print(f"✅ Schema created/updated: {schema_file}")
        else:
            print(f"⚡ DRY RUN: Schema would be created/updated: {schema_file}")

print("🎉 Agent finished processing all routes and schemas!")