import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { ReadTemplate } from "../../utils/GeneratorHelper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../..");

export default class ExpressJSTypeORM {
  constructor(options) {
    this.outputPath =
      options.directory &&
      typeof options.directory === "string" &&
      options.directory.trim() !== ""
        ? path.resolve(options.directory)
        : path.join(process.cwd(), "output");
    this.envPath =
      options.envPath &&
      typeof options.envPath === "string" &&
      options.envPath.trim() !== ""
        ? path.resolve(options.envPath)
        : null;
  }

  async GenerateDBConnect() {
    try {
      console.log("Generating TypeORM database configuration files...");

      // Generate database configuration
      await this.generateDatabaseConfig();

      // Generate data source
      await this.generateDataSource();

      // Generate environment file if path not specified
      if (!this.envPath) {
        await this.generateEnvFile();
      }

      // Generate package.json dependencies info
      await this.generateDependenciesInfo();

      console.log("✅ Database configuration files generated successfully!");
      console.log(`📁 Output directory: ${this.outputPath}`);
    } catch (error) {
      throw new Error(
        `Failed to generate database connection: ${error.message}`,
      );
    }
  }

  async generateDatabaseConfig() {
    const directory = path.join(this.outputPath, "src", "configs");

    const template = await ReadTemplate(
      path.join(projectRoot, "template/ExpressJS/TypeORM/database-config.txt"),
    );

    const fileName = "database-config.ts";
    const filePath = path.join(directory, fileName);

    await fs.promises.mkdir(directory, {
      recursive: true,
    });
    await fs.promises.writeFile(filePath, template, "utf8");

    console.log(`✅ Generated: ${fileName}`);
  }

  async generateDataSource() {
    const directory = path.join(this.outputPath, "src");

    const template = await ReadTemplate(
      path.join(projectRoot, "template/ExpressJS/TypeORM/data-source.txt"),
    );

    const fileName = "data-source.ts";
    const filePath = path.join(directory, fileName);

    await fs.promises.mkdir(directory, {
      recursive: true,
    });
    await fs.promises.writeFile(filePath, template, "utf8");

    console.log(`✅ Generated: ${fileName}`);
  }

  async generateEnvFile() {
    const directory = this.outputPath;

    const template = await ReadTemplate(
      path.join(projectRoot, "template/ExpressJS/TypeORM/env-example.txt"),
    );

    const fileName = ".env.example";
    const filePath = path.join(directory, fileName);

    await fs.promises.mkdir(directory, {
      recursive: true,
    });
    await fs.promises.writeFile(filePath, template, "utf8");

    console.log(`✅ Generated: ${fileName}`);
  }

  async generateDependenciesInfo() {
    const directory = this.outputPath;

    const template = await ReadTemplate(
      path.join(
        projectRoot,
        "template/ExpressJS/TypeORM/dependencies-info.txt",
      ),
    );

    const fileName = "TYPEORM_SETUP.md";
    const filePath = path.join(directory, fileName);

    await fs.promises.mkdir(directory, {
      recursive: true,
    });
    await fs.promises.writeFile(filePath, template, "utf8");

    console.log(`✅ Generated: ${fileName}`);
  }
}
