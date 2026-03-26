import { Command } from "commander";
import TypeORM from "../../../src/generators/NestJS/TypeORM.js";

export const generate = new Command("generate")
     .description("A command that generate all files neccessary for CRUD operations")
     .option("--directory <filePath>, -d", "Specify directory to create the project in.")
     .argument("<csvPath>", "Specify the directory of the CSV File.")
     .argument("<component>", "Specify component you want to generate.")
     .action(async (csvPath, component, opts) => {
          try {
               console.log("===========================================");
               console.log("Generate Command\n");
               console.log(`CSV Path: ${csvPath}`);
               console.log(`Component Generated: ${component}`);
               console.log(`Output Directory: ${opts.directory}\n`);

               console.log("===========================================");
               console.log("Initialize Generator...");
               const nestJSGenerator = new TypeORM({ csvPath, component, ...opts });
               await nestJSGenerator.Initialize();
               console.log("Finish Initalizing Generator");
               console.log("===========================================");

               await nestJSGenerator.GenerateComponent();
               console.log("Generating Component....");
               console.log("Finish generating component");
               console.log("===========================================");
          } catch (error) {
               throw new Error(`${error.message}`);
          }
     })
     .addHelpText(
          "after",
          `
    The CSV file should contain the following: 
        - First row: column headers to be use as field names.
        - First column: will be used as primary keys.
        - Subsequent rows: contains sample data used for analysis.

    For NestJS
        - Generate DTOs, controller, services, and modules.
        - Create TypeORM entity based on csv structure. 
        - Data validation pipes. 
        - Unit tests and integration tests (service.spec, controller.spec).

    Valid components: pipe | controller | service | module | entity | dto | test | all
    
    Example:
        1. $crud NestJS --directory <> [csvPath] [component]
        2. $crud NestJS [csvPath] [component]
    `,
     );
