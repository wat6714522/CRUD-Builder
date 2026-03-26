import { Command } from "commander";
import { execSync } from "child_process";
import { join } from "path";

const dependencies = [
     "@nestjs/typeorm",
     "@nestjs/mapped-types",
     "@nestjs/config",
     "class-validator",
     "class-transformer",
     "typeorm",
     "mysql2",
     "reflect-metadata",
];

const devDependencies = ["supertest", "@types/supertest", "ts-node", "@types/node"];

export const create = new Command("create")
     .description("A command that create the project for NestJS framework")
     .argument("<projectName>", "Specify the name of the project")
     .action((projectName) => {
          try {
               console.log("===========================================");
               console.log("Create Command!\n");
               console.log(`Project Name: ${projectName}`);

               console.log("Generating Project... ");
               const commandNestJS = `nest new ${projectName}`;

               execSync(commandNestJS, {
                    stdio: "inherit",
                    cwd: process.cwd(),
               });

               console.log("Installing Additional Packages... ");
               const dependenciesStr = dependencies.join(" ");
               const commandInstallDependencies = `npm install ${dependenciesStr} --save`;

               // Convert project name to kebab-case as NestJS CLI does
               const kebabCaseProjectName = projectName
                    .replace(/([a-z])([A-Z])/g, "$1-$2")
                    .replace(/[\s_]+/g, "-")
                    .toLowerCase();

               const projectPath = join(process.cwd(), kebabCaseProjectName);
               console.log(`Installing in: ${projectPath}`);

               execSync(commandInstallDependencies, {
                    stdio: "inherit",
                    cwd: projectPath,
               });

               console.log("Installing Test Dependencies... ");
               const devDependenciesStr = devDependencies.join(" ");
               const commandInstallDevDependencies = `npm install ${devDependenciesStr} --save-dev`;

               execSync(commandInstallDevDependencies, {
                    stdio: "inherit",
                    cwd: projectPath,
               });

               console.log("Configuring test runner... ");
               execSync(`npm pkg set scripts.test="node --require ts-node/register --test"`, {
                    stdio: "inherit",
                    cwd: projectPath,
               });

               console.log("Finished Generating Project...");
               console.log("===========================================");
          } catch (error) {
               throw new Error(`${error.message}`);
          }
     })
     .addHelpText(
          "after",
          `
        Examples: 
            $ crud NestJS create my-app
            $ crud NestJS create my-nest-project
        `,
     );
