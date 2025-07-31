import fs from "fs";
import path from "path";

const baseFile = path.resolve("prisma/base.prisma");
const inputDir = path.resolve("prisma/models");
const outputFile = path.resolve("prisma/schema.prisma");

// Manually define model order (add yours in correct order)
const manualOrder = ["Store", "User", "Admin", "Service", "Order"];

// Load base content
const base = fs.readFileSync(baseFile, "utf-8").trim();

// Read all model files into a map: { ModelName: content }
const modelMap = {};
const files = fs.readdirSync(inputDir).filter((f) => f.endsWith(".prisma"));

for (const file of files) {
  const content = fs.readFileSync(path.join(inputDir, file), "utf-8").trim();
  const match = content.match(/model\s+(\w+)\s+{/);
  if (!match) throw new Error(`No model found in ${file}`);
  const modelName = match[1];
  modelMap[modelName] = content;
}

// Build schema starting with manual order
const orderedModels = [];

// Add manually ordered models first
for (const name of manualOrder) {
  if (!modelMap[name]) throw new Error(`Missing model file for: ${name}`);
  orderedModels.push(modelMap[name]);
}

// Add any other models not in manualOrder
for (const name in modelMap) {
  if (!manualOrder.includes(name)) {
    orderedModels.push(modelMap[name]);
  }
}

// Final output
const finalSchema = `${base}\n\n${orderedModels.join("\n\n")}`;
fs.writeFileSync(outputFile, finalSchema);
console.log("✅ schema.prisma generated successfully with ordered models");
