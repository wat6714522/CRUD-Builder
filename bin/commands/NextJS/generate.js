import { Command } from "commander";
import NextJS from "../../../src/generators/NextJS/PrismaGenerator.js";

export const nextjsGenerate = new Command("generate")
  .description(
    "A command that generate all files neccessary for CRUD operations",
  )
  .option(
    "-d, --directory <filePath>",
    "Specifiy an output directory for generated files.",
  )
  .argument("<csvPath>", "Specify the directory of the CSV file.")
  .argument("<component>", "Specify component you want to generate.")
  .action(async (csvPath, component, opts) => {
    try {
      console.log("===========================================");
      console.log("Generate Command\n");
      console.log(`CSV Path: ${csvPath}`);
      console.log(`Component Generated: ${component}`);
      console.log(`Output Directory: ${opts.directory || "default"}\n`);

      console.log("===========================================");
      console.log("Initialize Generator...");
      const nextjsGenerate = new NextJS({
        csvPath,
        component,
        directory: opts.directory,
      });
      await nextjsGenerate.Initialize();
      console.log("Finish Initializing Generator");
      console.log("===========================================");

      await nextjsGenerate.GenerateComponent();
      console.log("Generating Component...");
      console.log("Finish Generating Component");
      console.log("===========================================");
    } catch (error) {
      throw new Error(`${error.message}`);
    }
  })
  .addHelpText(
    "after",
    `
        The CSV File should contain the following: 
            - First rows column headers to be use as field names. 
            - First columns will be used as primary keys. 
            - Subsequent rows contains sample data used for analysis.

        For NextJS
            - Generate API Routes and Server Actions.
            - Create PrismaORM schema based on csv structure.
            - Note: Prisma client is generated automatically by the 'connect' command
        
        Available Components:
            - schema: Generate Prisma schema file
            - api: Generate API routes for CRUD operations
            - server_actions: Generate server actions
            - all: Generate all components above
            
        Examples: 
            1. $crud NextJS generate -d ./src [csvPath] schema
            2. $crud NextJS generate [csvPath] api
            3. $crud NextJS generate [csvPath] all
            - Generate API Routes, Server Actions, and Next Authentication boilerplate." 
            - Create PrismaORM schema based on csv structure.
        
        Example: 
            1. $crud NextJS -d <> [csvPath] [component]
            2. $crud NextJS [csvPath] [component]
            `,
  );
