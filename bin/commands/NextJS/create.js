import { Command } from "commander";
import { execSync } from "child_process";
import { join } from "path";

export const nextjsCreate = new Command("create")
     .description("A command that will create the project for NextJS framework.")
     .action(() => {
          try {
               console.log("===========================================");
               console.log("Create Command!\n");

               console.log("Generating Command");
               const commandNextJS = `npx create-next-app`;

               execSync(commandNextJS, {
                    stdio: "inherit",
                    cwd: process.cwd(),
               });

               console.log("finished Genrating Project...");
               console.log("===========================================");
          } catch (error) {
               throw new Error(`${error.message}`);
          }
     })
     .addHelpText(
          "after",
          `
        Examples:
            $ crud NextJS create
    `,
     );
