import path from "path";

import ExpressJS from "./ExpressJS.js";
import readCSVFile from "../../utils/ReadFile.js";
import { readFile, createFile } from "../../utils/GeneratorHelper.js";

export default class ExpressJSGenerator extends ExpressJS {
     constructor(csvPath, options) {
          // Handle both absolute and relative paths
          let projectDirPath;
          if (options.directory && path.isAbsolute(options.directory)) {
               projectDirPath = options.directory;
          } else {
               projectDirPath = path.join(process.cwd(), options.directory || "");
          }

          super(projectDirPath);

          this.csvData = null;
          this.csvPath = csvPath;
          this.fields = [];
          this.primaryKey = "";
          this.generateAll = options.all;
          this.excludedFields = ["createdAt", "updatedAt", "created_at", "updated_at"];
          this.importTypeValidatorMap = {
               number: "IsNumber",
               string: "IsNotEmpty",
               boolean: "IsBoolean",
               date: "IsNotEmpty",
          };
          this.importTypeValidatorCheck = {
               number: false,
               string: false,
               boolean: false,
               date: false,
          };

          const entityName = path.basename(csvPath, ".csv");
          this.entityName = this.buildNameObj(entityName);
     }

     async Initialize() {
          // Read and parse data from CSV file
          await this.readDataFromCSV();

          // Generate components
          await this.generateComponents();

          // Modify existing files to include new components
          await this.modifyRoutesIndexFile();
          await this.modifyDataSourceFile();
     }

     async readDataFromCSV() {
          this.csvData = await readCSVFile(this.csvPath);
          this.fields = this.csvData.fields;
          this.primaryKey = this.csvData.metadata.primaryKeyField;
     }

     async generateComponents() {
          const entityProperties = this.getEntityProperties();
          const validatorImport = this.getValidatorImports();

          await this.generateFiles([
               {
                    templateFilePath: "src/controllers/controller.ts.txt",
                    outputFilePath: `src/controllers/${this.entityName.singular.pascalCase}Controller.ts`,
                    replacements: {
                         "{{EntityNameSingularPascalCase}}": this.entityName.singular.pascalCase,
                         "{{EntityNameSingularCamelCase}}": this.entityName.singular.camelCase,
                         "{{EntityNameSingularStartSentenceCase}}":
                              this.entityName.singular.startSentenceCase,
                         "{{EntityNameSingularMiddleSentenceCase}}":
                              this.entityName.singular.middleSentenceCase,
                         "{{EntityNamePluralKebabCase}}": this.entityName.plural.kebabCase,
                         "{{EntityNamePluralStartSentenceCase}}":
                              this.entityName.plural.startSentenceCase,
                         "{{EntityNamePluralMiddleSentenceCase}}":
                              this.entityName.plural.middleSentenceCase,
                    },
               },
               {
                    templateFilePath: "src/entities/entity.ts.txt",
                    outputFilePath: `src/entities/${this.entityName.singular.pascalCase}.ts`,
                    replacements: {
                         "{{EntityNameSingularPascalCase}}": this.entityName.singular.pascalCase,
                         "{{EntityNamePluralSnakeCase}}": this.entityName.plural.snakeCase,
                         "{{ValidatorImport}}": validatorImport,
                         "{{EntityProperties}}": entityProperties,
                    },
               },
               {
                    templateFilePath: "src/repositories/repository.ts.txt",
                    outputFilePath: `src/repositories/${this.entityName.singular.pascalCase}Repository.ts`,
                    replacements: {
                         "{{EntityNameSingularPascalCase}}": this.entityName.singular.pascalCase,
                         "{{EntityNameSingularCamelCase}}": this.entityName.singular.camelCase,
                    },
               },
               {
                    templateFilePath: "src/routes/routes.ts.txt",
                    outputFilePath: `src/routes/${this.entityName.singular.camelCase}Routes.ts`,
                    replacements: {
                         "{{EntityNameSingularPascalCase}}": this.entityName.singular.pascalCase,
                         "{{EntityNameSingularMiddleSentenceCase}}":
                              this.entityName.singular.middleSentenceCase,
                         "{{EntityNamePluralKebabCase}}": this.entityName.plural.kebabCase,
                         "{{EntityNamePluralMiddleSentenceCase}}":
                              this.entityName.plural.middleSentenceCase,
                    },
               },
          ]);
     }

     async modifyRoutesIndexFile() {
          const pathAbs = path.join(this.projectDirPath, "src/routes/index.ts");

          let content = await readFile(pathAbs);

          // Only add import if not present
          const importLine = `import ${this.entityName.singular.camelCase}Routes from "./${this.entityName.singular.camelCase}Routes";`;
          if (!content.includes(importLine)) {
               content = content.replace(/(\/\/ Import routes)/, `$1\n${importLine}`);
          }

          // Only add router.use if not present
          const routerUseLint = `router.use("/${this.entityName.plural.camelCase}", ${this.entityName.singular.camelCase}Routes);`;
          if (!content.includes(routerUseLint)) {
               content = content.replace(/(\/\/ API routes)/, `$1\n${routerUseLint}`);
          }

          await createFile(pathAbs, content);
     }

     async modifyDataSourceFile() {
          const pathAbs = path.join(this.projectDirPath, "src/data-source.ts");

          let content = await readFile(pathAbs);

          const entityName = this.entityName.singular.pascalCase;

          // Only add entities if not present
          if (!content.includes(entityName)) {
               content = content.replace(/(\/\/ Entities)/, `$1\n    ${entityName},`);
          }

          // Only add import if not present
          const importLine = `import { ${entityName} } from "./entities/${entityName}";`;
          if (!content.includes(importLine)) {
               content = content.replace(/(\/\/ Import entities)/, `$1\n${importLine}`);
          }

          await createFile(pathAbs, content);
     }

     getEntityProperties() {
          const decoratorMap = {
               number: `@IsNumber({}, { message: "{{FieldName}} must be a number" })`,
               string: `@IsNotEmpty({ message: "{{FieldName}} is required" })`,
               boolean: `@IsBoolean({ message: "{{FieldName}} must be a boolean" })`,
               date: `@IsNotEmpty({ message: "{{FieldName}} is required" })`,
          };

          return this.fields
               .filter((field) => !this.excludedFields.includes(field))
               .map((field) => {
                    const type = this.csvData.metadata.entityMapped[field];
                    const isPrimaryKey = field === this.primaryKey;

                    let decorator;
                    let isType;

                    if (isPrimaryKey) {
                         decorator = "@PrimaryGeneratedColumn()";
                         isType = "number";
                    } else if (type == "date") {
                         decorator = "  @Column('timestamp')";
                         isType = "Date";
                    } else {
                         decorator = "  @Column()";
                         decorator += `\n  ${decoratorMap[type].replace("{{FieldName}}", field)}`;
                         isType = type;
                         this.importTypeValidatorCheck[type] = true;
                    }

                    return `${decorator}\n  ${field}!: ${isType};`;
               })
               .join("\n\n");
     }

     getValidatorImports() {
          const imports = Object.entries(this.importTypeValidatorCheck)
               .filter(([_, needed]) => needed)
               .map(([type, _]) => this.importTypeValidatorMap[type]);
          return imports.length > 0
               ? `import { ${imports.join(", ")} } from "class-validator";`
               : "";
     }
}
