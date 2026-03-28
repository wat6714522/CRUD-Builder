import { Command } from "commander";
import ExpressJSTypeORM from "../../../src/generators/ExpressJS/ExpressJSTypeORM.js";

export const dBconnect = new Command("connect")
     .description("A command that initializes TypeORM database connection for ExpressJS")
     .option("--directory <path>, -d", "Specify the output path of the database config file.")
     .option(
          "--envPath <path>, -e",
          "Specify the path of the .env file of database environment variable",
     )
     .action((opts) => {
          try {
               console.log("===========================================");
               console.log("ExpressJS TypeORM Connect Command\n");
               console.log(`Database Connection: ${opts.directory}`);
               console.log(`Env File Path: ${opts.envPath}`);

               const expressJSTypeORM = new ExpressJSTypeORM(opts);
               expressJSTypeORM.GenerateDBConnect();

               console.log("===========================================");
          } catch (error) {
               throw new Error(`Something went wrong: ${error.message}`);
          }
     })
     .addHelpText(
          "after",
          `
        Examples: 
            1. $crud ExpressJS connect --directory <filePath>
            2. $crud ExpressJS connect --directory <filePath> --envPath <filePath> 
            3. $crud ExpressJS connect

          The .env file should contain following variable with exact names:
            1. DB_TYPE (postgres, mysql, mariadb, sqlite)
            2. DB_HOST
            3. DB_PORT
            4. DB_USERNAME
            5. DB_PASSWORD
            6. DB_NAME
            7. DB_SYNCHRONIZE (true/false)
            8. DB_LOGGING (true/false)
        `,
     );
