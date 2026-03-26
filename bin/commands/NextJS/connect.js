import { Command } from "commander";
import { execSync } from "child_process";
import { findFile } from "../../../src/utils/GeneratorHelper.js";
import NextJS from "../../../src/generators/NextJS/PrismaGenerator.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

export const nextjsConnect = new Command("connect")
  .description(
    "A command that generate a singleton Prisma Client instance and database migration.",
  )
  .option(
    "--envPath <path>",
    "Specify the path of the .env file of database environment variable.",
  )
  .option("--schema <path>", "Specify the path of your schema.")
  .argument("<provider>", "Specify the database provider you want to use.")
  .action(async (provider, opts) => {
    try {
      console.log("===========================================");
      console.log("Connect Command\n");
      console.log(`ENV Path: ${opts.envPath}`);
      console.log(`Database Provider: ${provider}`);
      console.log("===========================================");
      console.log("Installing Additional Dependencies");

      // Check if we're in a Next.js project directory (has package.json)
      const packageJsonPath = path.join(process.cwd(), "package.json");
      if (!fs.existsSync(packageJsonPath)) {
        console.log("⚠️  No package.json found in current directory.");
        console.log(
          "💡 Please run this command from within your Next.js project directory.",
        );
        console.log(
          "   The directory should contain package.json and typically be your output directory.",
        );
        throw new Error(
          "Missing package.json - not a valid Node.js project directory",
        );
      }

      const providerPackageMap = {
        mysql: "mysql2",
        postgresql: "pg",
        postgres: "pg",
        sqlite: "sqlite3",
        sqlserver: "tedious",
      };
      const providerPkg = providerPackageMap[provider] || null;
      const dependencies = ["prisma", "@prisma/client"].concat(
        providerPkg ? [providerPkg] : [],
      );

      const dependenciesStr = dependencies.join(" ");
      const commandInstallDependencies = `npm install ${dependenciesStr} --save`;

      console.log(`📍 Installing dependencies in: ${process.cwd()}`);
      execSync(commandInstallDependencies, {
        stdio: "inherit",
        cwd: process.cwd(),
      });

      console.log("Finish Installed Additional Dependencies");
      console.log("===========================================");
      console.log("Checking necessary file");

      const env = opts.envPath
        ? opts.envPath
        : findFile(process.cwd(), ".env") ||
          findFile(process.cwd(), ".env.local") ||
          findFile(process.cwd(), "database.env");
      if (env == null) {
        throw new Error(
          "Missing environment file (.env, .env.local, or database.env)",
        );
      }

      // Load environment variables from the .env file
      console.log(`Loading environment variables from: ${env}`);
      dotenv.config({ path: env });

      // Verify DATABASE_URL is loaded
      if (!process.env.DATABASE_URL) {
        throw new Error(`DATABASE_URL not found in environment file: ${env}`);
      }

      const schema = opts.schema
        ? opts.schema
        : findFile(process.cwd(), "schema.prisma");
      if (schema == null) {
        throw new Error("Missing schema file.");
      }

      console.log("===========================================");
      console.log("Pushing schema to database and generating Prisma client");

      // Use db push instead of migrate dev to avoid destroying existing schema
      const pushCommand = `npx prisma db push --schema ${schema}`;
      execSync(pushCommand, {
        stdio: "inherit",
        cwd: process.cwd(),
        env: { ...process.env },
      });

      // Generate Prisma client
      console.log("Generating Prisma client...");
      const generateCommand = `npx prisma generate --schema ${schema}`;
      execSync(generateCommand, {
        stdio: "inherit",
        cwd: process.cwd(),
        env: { ...process.env },
      });

      console.log("===========================================");
      console.log("Finding your singleton Prisma Client instance...");

      // Check for Prisma client files in multiple possible locations
      const possiblePrismaFiles = [
        "src/lib/prisma.ts",
        "lib/prisma.ts",
        "prisma.ts",
        "src/lib/prisma.js",
        "lib/prisma.js",
        "prisma.js",
      ];

      let prisma = null;
      for (const filePath of possiblePrismaFiles) {
        prisma = findFile(process.cwd(), filePath);
        if (prisma) break;
      }

      if (prisma == null) {
        console.log("Cannot find your singleton prisma client instance.");
        console.log("Generating Prisma Client Manager...");

        const nextjsGenerator = new NextJS({
          csvPath: null,
          component: "client",
          directory: process.cwd(),
        });
        await nextjsGenerator.GeneratePrismaClientManager();
        console.log(
          "Prisma Client Manager generated successfully at lib/prisma.ts",
        );
      } else {
        console.log(
          `Your singleton Prisma Client instance is found at: ${prisma}`,
        );
        console.log(
          "Skipping Prisma Client Manager generation - file already exists.",
        );
      }

      console.log("Finished creating Prisma Client");
      console.log("===========================================");
    } catch (error) {
      throw new Error(`${error.message}`);
    }
  })
  .addHelpText(
    "after",
    `
        Important Notes:
        - Run this command inside your Next.js project directory
        - Ensure your .env file contains DATABASE_URL and DATABASE_PROVIDER
        - This command will install Prisma dependencies automatically
        - This command generates the singleton Prisma client (src/lib/prisma.ts) if not found
        
        Environment Variables Required:
        - DATABASE_URL: Your database connection string
        - DATABASE_PROVIDER: Database type (mysql, postgresql, sqlite, etc.)
        
        Examples:
            $ crud NextJS connect mysql
            $ crud NextJS connect postgresql --envPath ./.env.local
            $ crud NextJS connect sqlite --schema ./custom/schema.prisma
            
        If you see workspace warnings, make sure you're running this inside your Next.js project, not a parent directory.
    `,
  );
