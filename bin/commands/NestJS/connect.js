import { Command } from "commander";
import TypeORM from "../../../src/generators/NestJS/TypeORM.js";

export const dBconnect = new Command("connect")
     .description(
          `A command that initailize the project for target framework

    The .env file should contain following variable with exact names:
      DB_TYPE, DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME`,
     )
     .option("--directory <path>, -d", "Specify the output path of the database config file.")
     .option(
          "--envPath <path>, -e",
          "Specify the path of the .env file of database environment variable",
     )
     .action(async (opts) => {
          try {
               console.log("===========================================");
               console.log("Connect Command\n");
               console.log(`Database Connection: ${opts.directory}`);
               console.log(`Env File Path: ${opts.envPath}`);

               const nestJS = new TypeORM(opts);
               await nestJS.GenerateDBConnect();

               console.log("===========================================");
          } catch (error) {
               throw new Error(`Something went wrong: ${error.message}`);
          }
     })
     .addHelpText(
          "after",
          `
    Examples:
        1. $crud NestJS connect --directory <filePath>
        2. $crud NestJS connect --directory <filePath> --envPath <filePath>
        3. $crud NestJS connect
    `,
     );
