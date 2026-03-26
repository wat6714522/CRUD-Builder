import { Command } from "commander";
import NextJS from "../../../src/generators/NextJS/PrismaGenerator.js";
import fs from "fs";
import path from "path";

export const nextjsGenerateMultiple = new Command("generate-multiple")
  .description(
    "Generate CRUD operations for multiple CSV files without overwriting the schema",
  )
  .option(
    "-d, --directory <filePath>",
    "Specify an output directory for generated files.",
  )
  .option(
    "-p, --pattern <pattern>",
    "CSV file pattern to match (default: *.csv)",
    "*.csv",
  )
  .argument(
    "[csvDirectory]",
    "Directory containing CSV files (default: current directory)",
    ".",
  )
  .action(async (csvDirectory, opts) => {
    try {
      console.log("===========================================");
      console.log("Multi-CSV Generation Command\n");
      console.log(`CSV Directory: ${csvDirectory}`);
      console.log(`File Pattern: ${opts.pattern}`);
      console.log(`Output Directory: ${opts.directory || "default"}\n`);

      // Find all CSV files in the directory
      const csvFiles = findCsvFiles(csvDirectory, opts.pattern);

      if (csvFiles.length === 0) {
        console.log(
          `❌ No CSV files found in ${csvDirectory} matching pattern ${opts.pattern}`,
        );
        return;
      }

      console.log(`📁 Found ${csvFiles.length} CSV files:`);
      csvFiles.forEach((file, index) => {
        console.log(`   ${index + 1}. ${path.basename(file)}`);
      });
      console.log("===========================================");

      // Process each CSV file
      for (let i = 0; i < csvFiles.length; i++) {
        const csvFile = csvFiles[i];
        const entityName = path.basename(csvFile, ".csv");

        console.log(
          `\n🔄 Processing ${i + 1}/${csvFiles.length}: ${entityName}`,
        );
        console.log("===========================================");

        try {
          const nextjsGenerator = new NextJS({
            csvPath: csvFile,
            component: "all",
            directory: opts.directory,
          });

          await nextjsGenerator.Initialize();
          console.log(`✅ Initialized generator for ${entityName}`);

          await nextjsGenerator.GenerateComponent();
          console.log(`✅ Generated all components for ${entityName}`);
        } catch (error) {
          console.error(`❌ Error processing ${entityName}:`, error.message);
          continue; // Continue with next file
        }
      }

      console.log("\n===========================================");
      console.log("🎉 Multi-CSV generation completed!");
      console.log("===========================================");

      // Show next steps
      console.log("\n📋 Next steps:");
      console.log("1. Navigate to your output directory");
      console.log(
        "2. Run 'npm install @prisma/client prisma' to install Prisma",
      );
      console.log("3. Run 'npx prisma generate' to generate the Prisma client");
      console.log("4. Configure your database URL in .env file");
      console.log("5. Run 'npx prisma db push' to create database tables");
    } catch (error) {
      throw new Error(`Multi-CSV generation failed: ${error.message}`);
    }
  })
  .addHelpText(
    "after",
    `
        Multi-CSV Generation for NextJS:
            - Processes multiple CSV files in sequence
            - Accumulates models in a single schema.prisma file
            - Generates API routes and server actions for each entity
            - Prevents schema overwriting between entities

        Examples:
            1. Generate from all CSV files in current directory:
               crud NextJS generate-multiple

            2. Generate from specific directory:
               crud NextJS generate-multiple ./csv-files

            3. Generate with custom output directory:
               crud NextJS generate-multiple -d ./my-next-app ./csv-files

            4. Generate with custom file pattern:
               crud NextJS generate-multiple -p "*.csv" ./data
    `,
  );

// Helper function to find CSV files
function findCsvFiles(directory, pattern) {
  const resolvedDir = path.resolve(directory);

  if (!fs.existsSync(resolvedDir)) {
    throw new Error(`Directory not found: ${resolvedDir}`);
  }

  const files = fs.readdirSync(resolvedDir);
  const csvFiles = files
    .filter((file) => {
      // Skip hidden files (files starting with .)
      if (file.startsWith(".")) {
        return false;
      }

      if (pattern === "*.csv") {
        return file.endsWith(".csv");
      }
      // Simple pattern matching - can be enhanced with glob if needed
      return file.match(new RegExp(pattern.replace("*", ".*")));
    })
    .map((file) => path.join(resolvedDir, file));

  return csvFiles;
}
