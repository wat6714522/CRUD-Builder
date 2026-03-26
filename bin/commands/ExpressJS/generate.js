import { Command } from "commander";

import ExpressJSGenerator from "../../../src/generators/ExpressJS/ExpressJSGenerator.js";

export const generate = new Command()
  .name("generate")
  .description(
    "A command that generate all files neccessary for CRUD operations from a CSV file for ExpressJS framework",
  )
  .argument("<csvPath>", "Specify the path of the input CSV File.")
  .option(
    "-d, --directory <directoryPath>",
    "Specify the output root project directory of the files to be created",
  )
  .action((csvPath, options) => {
    try {
      console.log("===========================================");
      console.log("Generate Command\n");

      console.log("Generating Components...");

      const generator = new ExpressJSGenerator(csvPath, options);

      console.log(`CSV Path: ${generator.csvPath}`);
      console.log(`Output Project Directory Path: ${generator.projectDirPath}`);

      generator.Initialize();

      console.log("Finished Generating Components");
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

    For ExpressJS
        - Generate routes, controllers, entities, and repositories.
        - Create TypeORM entity based on csv structure.
    
    Example:
        $ crud expressjs users.csv
        $ crud expressjs users.csv --directory ./my-express-project
    `,
  );
