import { Command } from "commander";

import ExpressJSCreator from "../../../src/generators/ExpressJS/ExpressJSCreator.js";

export const create = new Command()
  .name("create")
  .description(
    "A command that create the scaffolding project for ExpressJS framework",
  )
  .argument("<projectName>", "Specify the name of the project")
  .option(
    "-d, --directory <directoryPath>",
    "Specify the output directory of the project to be created",
  )
  .action(async (projectName, options) => {
    try {
      console.log("===========================================");
      console.log("Create Command!\n");

      console.log("Initializing Project...");

      const creator = new ExpressJSCreator(projectName, options);

      console.log(`Project Name: ${creator.projectName.singular.kebabCase}`);
      console.log(`Project Directory Path: ${creator.projectDirPath}`);

      await creator.Initialize();

      console.log("Finished Initializing Project!");
      console.log("===========================================");
    } catch (error) {
      throw new Error(`${error.message}`);
    }
  })
  .addHelpText(
    "after",
    `
        Examples: 
            $ crud expressjs create my-express-project
            $ crud expressjs create my-express-project --directory ./my-workspace
        `,
  );
