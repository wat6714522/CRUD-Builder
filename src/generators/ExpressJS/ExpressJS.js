import path from "path";
import { fileURLToPath } from "url";

import {
  readFile,
  createDirectoryIfNotExists,
  createFile,
  toPascalCase,
  toCamelCase,
  toKebabCase,
  toSnakeCase,
  toTitleCase,
  toStartSentenceCase,
  toMiddleSentenceCase,
  toSingular,
  toPlural,
} from "../../utils/GeneratorHelper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDirPath = path.resolve(__dirname, "../../..");

export default class ExpressJS {
  constructor(projectDirPath) {
    this.templateDirPath = path.join(rootDirPath, "template", "ExpressJS");
    this.projectDirPath = projectDirPath;
  }

  buildNameObj(name = "Dummy") {
    return {
      singular: {
        pascalCase: toSingular(toPascalCase(name)),
        camelCase: toSingular(toCamelCase(name)),
        kebabCase: toSingular(toKebabCase(name)),
        snakeCase: toSingular(toSnakeCase(name)),
        titleCase: toSingular(toTitleCase(name)),
        startSentenceCase: toSingular(toStartSentenceCase(name)),
        middleSentenceCase: toSingular(toMiddleSentenceCase(name)),
      },
      plural: {
        pascalCase: toPlural(toPascalCase(name)),
        camelCase: toPlural(toCamelCase(name)),
        kebabCase: toPlural(toKebabCase(name)),
        snakeCase: toPlural(toSnakeCase(name)),
        titleCase: toPlural(toTitleCase(name)),
        startSentenceCase: toPlural(toStartSentenceCase(name)),
        middleSentenceCase: toPlural(toMiddleSentenceCase(name)),
      },
    };
  }

  async generateFileFromTemplate(
    templateFilePath = "",
    outputFilePath = "",
    replacements = {},
  ) {
    const templateFilePathAbs = path.join(
      this.templateDirPath,
      templateFilePath,
    );
    const outputFilePathAbs = path.join(this.projectDirPath, outputFilePath);

    const template = await readFile(templateFilePathAbs);
    const content = this.replacePlaceholderInTemplate(template, replacements);

    await createDirectoryIfNotExists(path.dirname(outputFilePathAbs));
    await createFile(outputFilePathAbs, content);
  }

  replacePlaceholderInTemplate(template, replacements) {
    let content = String(template);

    for (const [placeholder, value] of Object.entries(replacements)) {
      content = content.replace(
        new RegExp(placeholder.replace(/[{}]/g, "\\$&"), "g"),
        value,
      );
    }

    return content;
  }

  async generateFiles(filesMapping = []) {
    for (const fileMapper of filesMapping) {
      await this.generateFileFromTemplate(
        fileMapper.templateFilePath,
        fileMapper.outputFilePath,
        fileMapper.replacements,
      );
    }
  }
}
