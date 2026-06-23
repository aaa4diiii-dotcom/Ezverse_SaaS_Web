import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read from command-line argument, environment variable, or default relative path
const inputPath = process.argv[2] || process.env.SUPABASE_SCHEMA_JSON_PATH || path.resolve(__dirname, "../supabase-schema.json");
const outputPath = path.resolve(__dirname, "../../src/integrations/supabase/types.ts");

try {
  if (!fs.existsSync(inputPath)) {
    console.error(`Error: Input schema file not found at: ${inputPath}`);
    console.log("\nUsage:");
    console.log("  node backend/scripts/generate-types.js <path-to-json-or-txt>");
    console.log("\nAlternatively, set SUPABASE_SCHEMA_JSON_PATH in your environment or place 'supabase-schema.json' in the 'backend' folder.");
    process.exit(1);
  }

  const content = fs.readFileSync(inputPath, "utf8");
  let typesContent = "";

  try {
    const json = JSON.parse(content);
    // Support parsing both direct file content and JSON format with a "types" property
    typesContent = json.types || json.content || content;
  } catch (e) {
    // If not valid JSON, treat the entire file as the raw typescript content
    typesContent = content;
  }

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, typesContent, "utf8");
  console.log(`Success: Types written successfully to ${outputPath}`);
} catch (error) {
  console.error("Failed to generate types:", error.message);
  process.exit(1);
}
