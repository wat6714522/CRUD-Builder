import path from "path";

import ExpressJS from "./ExpressJS.js";
import { createDirectoryIfNotExists } from "../../utils/GeneratorHelper.js";

export default class ExpressJSCreator extends ExpressJS {
  constructor(projectName, options) {
    const projectDirPath = path.join(
      process.cwd(),
      options.directory || "",
      projectName,
    );

    super(projectDirPath);

    this.projectName = this.buildNameObj(projectName);
  }

  async Initialize() {
    // Create project directory
    await createDirectoryIfNotExists(this.projectDirPath);

    // Generate project scaffolding directory and files
    await this.generateProjectScaffolding();
  }

  async generateProjectScaffolding() {
    await this.generateFiles([
      {
        templateFilePath: "package.json.txt",
        outputFilePath: "package.json",
        replacements: {
          "{{ProjectName}}": this.projectName.singular.kebabCase,
        },
      },
      {
        templateFilePath: "tsconfig.json.txt",
        outputFilePath: "tsconfig.json",
        replacements: {},
      },
      {
        templateFilePath: "nodemon.json.txt",
        outputFilePath: "nodemon.json",
        replacements: {},
      },
      {
        templateFilePath: "env.example.txt",
        outputFilePath: ".env.example",
        replacements: {
          "{{ProjectName}}": this.projectName.singular.kebabCase,
        },
      },
      {
        templateFilePath: "gitignore.txt",
        outputFilePath: ".gitignore",
        replacements: {},
      },
      {
        templateFilePath: "README.md.txt",
        outputFilePath: "README.md",
        replacements: {
          "{{ProjectName}}": this.projectName.singular.kebabCase,
        },
      },
      {
        templateFilePath: "src/server.ts.txt",
        outputFilePath: "src/server.ts",
        replacements: {},
      },
      {
        templateFilePath: "src/data-source.ts.txt",
        outputFilePath: "src/data-source.ts",
        replacements: {},
      },
      {
        templateFilePath: "src/app.ts.txt",
        outputFilePath: "src/app.ts",
        replacements: {},
      },
      {
        templateFilePath: "src/routes/index.ts.txt",
        outputFilePath: "src/routes/index.ts",
        replacements: {},
      },
      {
        templateFilePath: "src/configs/config.ts.txt",
        outputFilePath: "src/configs/config.ts",
        replacements: {
          "{{ProjectName}}": this.projectName.singular.kebabCase,
        },
      },
    ]);
  }
}
