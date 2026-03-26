import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import {
     ReadTemplate,
     toCamelCase,
     toKebabCase,
     toPascalCase,
} from "../../utils/GeneratorHelper.js";
import readFile from "../../utils/ReadFile.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../..");

export default class TypeORM {
     constructor(options) {
          this.csvData = null;
          this.csvPath = options.csvPath;
          this.outputPath =
               options.directory &&
               typeof options.directory === "string" &&
               options.directory.trim() !== ""
                    ? path.resolve(options.directory)
                    : path.join(process.cwd(), "output");
          this.component = options.component?.toLowerCase() || "";
          this.fields = [];
          this.EntityName = {
               toPascalCase: "",
               toCamelCase: "",
               toKebabCase: "",
          };
          this.primaryKey = "";
          this.generateAll = options.all;
     }

     async Initialize() {
          this.csvData = await readFile(this.csvPath);
          this.fields = this.csvData.fields;
          this.primaryKey = this.csvData.metadata.primaryKeyField;

          const fileName = path.basename(this.csvPath, ".csv");
          this.EntityName = {
               toPascalCase: toPascalCase(fileName),
               toCamelCase: toCamelCase(fileName),
               toKebabCase: toKebabCase(fileName),
          };
     }

     async GenerateComponent() {
          const component = String(this.component);

          switch (component) {
               case "pipe":
                    return await this.GeneratePipes();
               case "controller":
                    return await this.GenerateController();
               case "service":
                    return await this.GenerateService();
               case "module":
                    return await this.GenerateModule();
               case "entity":
                    return await this.GenerateEntity();
               case "dto":
                    return await this.GenerateDto();
               case "test":
                    return await this.GenerateTests();
               case "all":
                    const results = {
                         pipe: await this.GeneratePipes(),
                         controller: await this.GenerateController(),
                         service: await this.GenerateService(),
                         module: await this.GenerateModule(),
                         entity: await this.GenerateEntity(),
                         dto: await this.GenerateDto(),
                         test: await this.GenerateTests(),
                    };

                    return results;
               default:
                    throw new Error("Unsupport Component! Please try Again.");
          }
     }

     async GenerateEntity() {
          const directory = path.join(this.outputPath, "entities");

          const template = await ReadTemplate(
               path.join(projectRoot, "template/NestJS/TypeORM/entity.txt"),
          );
          const content = this.replaceTemplateEntity(template);
          const fileName = `${this.EntityName.toKebabCase}.entity.ts`;
          const filePath = path.join(directory, fileName);

          await fs.promises.mkdir(directory, {
               recursive: true,
          });
          await fs.promises.writeFile(filePath, content, "utf8");
     }

     GenerateEntityProperties() {
          // Filter out common timestamp fields that are auto-generated
          const timestampFields = ["createdAt", "updatedAt", "created_at", "updated_at"];

          return this.fields
               .filter((field) => !timestampFields.includes(field))
               .map((field) => {
                    const sampleValue = this.csvData.records[0]?.[field];
                    const type = this.csvData.metadata.entityMapped[field];
                    const isPrimaryKey = field === this.primaryKey;

                    let decorator;
                    let isType;

                    if (isPrimaryKey) {
                         decorator = "@PrimaryGeneratedColumn()";
                         isType = "number";
                    } else if (type == "date") {
                         decorator = "@Column({ type: 'timestamp' })";
                         isType = "Date";
                    } else if (type == "string") {
                         decorator = "@Column({ type: 'varchar', nullable: true })";
                         isType = "string";
                    } else if (type == "integer" || type == "number") {
                         decorator = "@Column({ type: 'int', nullable: true })";
                         isType = "number";
                    } else if (type == "float" || type == "decimal") {
                         decorator =
                              "@Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) } })";
                         isType = "number";
                    } else if (type == "boolean") {
                         decorator = "@Column({ type: 'boolean', nullable: true })";
                         isType = "boolean";
                    } else {
                         decorator = "@Column()";
                         isType = "string";
                    }

                    return `    ${decorator}
    ${field}!: ${isType};`;
               })
               .join("\n\n");
     }

     replaceTemplateEntity(template) {
          const variables = {
               "{{EntityName}}": this.EntityName.toPascalCase,
               "{{FileName}}": this.EntityName.toKebabCase,
               "{{EntityProperties}}": this.GenerateEntityProperties(),
          };

          let content = String(template);

          for (const [placeholder, value] of Object.entries(variables)) {
               content = content.replace(
                    new RegExp(placeholder.replace(/[{}]/g, "\\$&"), "g"),
                    value,
               );
          }

          // Debug: console.info(`Generated Content: ${content}`);

          return content;
     }

     async GenerateDto() {
          const directory = path.join(this.outputPath, "dto");

          const createTemplate = await ReadTemplate(
               path.join(projectRoot, "template/NestJS/TypeORM/DTO/create.txt"),
          );
          const createContent = this.replaceTemplateDTO(createTemplate);
          const createFileName = `create-${this.EntityName.toKebabCase}.dto.ts`;
          const createFilePath = path.join(directory, createFileName);

          const updateTemplate = await ReadTemplate(
               path.join(projectRoot, "template/NestJS/TypeORM/DTO/update.txt"),
          );
          const updateContent = this.replaceTemplateDTO(updateTemplate);
          const updateFileName = `update-${this.EntityName.toKebabCase}.dto.ts`;
          const updateFilePath = path.join(directory, updateFileName);

          const idParamContent = await ReadTemplate(
               path.join(projectRoot, "template/NestJS/TypeORM/DTO/id-param.txt"),
          );
          const idParamFileName = "id-param.dto.ts";
          const idParamFilePath = path.join(directory, idParamFileName);

          const paginationContent = await ReadTemplate(
               path.join(projectRoot, "template/NestJS/TypeORM/DTO/pagination.txt"),
          );
          const paginationFileName = "pagination.dto.ts";
          const paginationFilePath = path.join(directory, paginationFileName);

          await fs.promises.mkdir(directory, {
               recursive: true,
          });
          await fs.promises.writeFile(createFilePath, createContent, "utf8");
          await fs.promises.writeFile(updateFilePath, updateContent, "utf-8");
          await fs.promises.writeFile(idParamFilePath, idParamContent, "utf-8");
          await fs.promises.writeFile(paginationFilePath, paginationContent, "utf-8");
     }

     GenerateDTOProperties() {
          // Filter out primary key and common timestamp fields
          const timestampFields = ["createdAt", "updatedAt", "created_at", "updated_at"];

          return this.fields
               .filter((field) => field !== this.primaryKey && !timestampFields.includes(field))
               .map((field) => {
                    const sampleValue = this.csvData.records[0]?.[field];
                    const type = this.csvData.metadata.entityMapped[field];

                    let decorators = [];
                    let integerDecorators = [];

                    switch (type) {
                         case "string":
                              decorators.push("@IsString()");
                              break;
                         case "integer":
                         case "number":
                              decorators.push("@IsInt()");
                              break;
                         case "float":
                         case "decimal":
                              decorators.push("@IsNumber()");
                              break;
                         case "date":
                              decorators.push("@IsDateString()");
                              break;
                         case "boolean":
                              decorators.push("@IsBoolean()");
                              break;
                         default:
                              decorators.push("@IsString()");
                              break;
                    }

                    const isEmpty =
                         sampleValue === null ||
                         sampleValue === undefined ||
                         sampleValue === "" ||
                         (typeof sampleValue === "string" && sampleValue.trim() === "");

                    let emptyDecorators = [];

                    // For boolean fields, don't use @IsNotEmpty as it doesn't make sense
                    if (type === "boolean") {
                         emptyDecorators.push("@IsOptional()");
                    } else if (!isEmpty) {
                         emptyDecorators.push("@IsNotEmpty()");
                    } else {
                         emptyDecorators.push("@IsOptional()");
                    }

                    // Map CSV types to valid TypeScript types
                    let tsType;
                    if (type === "date") {
                         tsType = "string";
                    } else if (
                         type === "integer" ||
                         type === "float" ||
                         type === "decimal" ||
                         type === "number"
                    ) {
                         tsType = "number";
                    } else if (type === "boolean") {
                         tsType = "boolean";
                    } else {
                         tsType = "string";
                    }

                    return `${decorators}
    ${integerDecorators}
    ${emptyDecorators}
    ${field} : ${tsType};`;
               })
               .join("\n\n    ");
     }

     replaceTemplateDTO(template) {
          const variables = {
               "{{EntityName}}": this.EntityName.toPascalCase,
               "{{FileName}}": this.EntityName.toKebabCase,
               "{{DTOProperties}}": this.GenerateDTOProperties(),
          };

          let content = String(template);

          for (const [placeholder, value] of Object.entries(variables)) {
               content = content.replace(
                    new RegExp(placeholder.replace(/[{}]/g, "\\$&"), "g"),
                    value,
               );
          }

          // Debug: console.log(`Generated Template:\n ${content}`);

          return content;
     }

     async GeneratePipes() {
          const directory = path.join(this.outputPath, "pipes");

          const parseIDPipeContent = await ReadTemplate(
               path.join(projectRoot, "template/NestJS/TypeORM/Pipes/ParseIDPipe.txt"),
          );
          const parseIDPipeFileName = "parse-id.pipe.ts";
          const parseIDPipeFilePath = path.join(directory, parseIDPipeFileName);

          const parseBoolPipeContent = await ReadTemplate(
               path.join(projectRoot, "template/NestJS/TypeORM/Pipes/ParseBoolPipe.txt"),
          );
          const parseBoolPipeFileName = "parse-bool.pipe.ts";
          const parseBoolPipeFilePath = path.join(directory, parseBoolPipeFileName);

          const parseArrayPipeContent = await ReadTemplate(
               path.join(projectRoot, "template/NestJS/TypeORM/Pipes/ParseArrayPipe.txt"),
          );
          const parseArrayPipeFileName = "parse-array.pipe.ts";
          const parseArrayPipeFilePath = path.join(directory, parseArrayPipeFileName);

          const parseUuidPipeContent = await ReadTemplate(
               path.join(projectRoot, "template/NestJS/TypeORM/Pipes/ParseUUIDPipe.txt"),
          );
          const parseUuidPipeFileName = "parse-uuid.pipe.ts";
          const parseUuidPipeFilePath = path.join(directory, parseUuidPipeFileName);

          const requestHeaderPipeContent = await ReadTemplate(
               path.join(projectRoot, "template/NestJS/TypeORM/Pipes/RequestHeader.txt"),
          );
          const requestHeaderPipeFileName = "request-header.pipe.ts";
          const requestHeaderPipeFilePath = path.join(directory, requestHeaderPipeFileName);

          await fs.promises.mkdir(directory, {
               recursive: true,
          });

          await fs.promises.writeFile(parseIDPipeFilePath, parseIDPipeContent, "utf8");
          await fs.promises.writeFile(parseUuidPipeFilePath, parseUuidPipeContent, "utf8");
          await fs.promises.writeFile(parseArrayPipeFilePath, parseArrayPipeContent, "utf8");
          await fs.promises.writeFile(parseBoolPipeFilePath, parseBoolPipeContent, "utf8");
          await fs.promises.writeFile(requestHeaderPipeFilePath, requestHeaderPipeContent, "utf8");
     }

     async GenerateService() {
          const directory = path.join(this.outputPath, "services");

          const template = await ReadTemplate(
               path.join(projectRoot, "template/NestJS/TypeORM/service.txt"),
          );
          const content = this.replaceTemplate(template);
          const fileName = `${this.EntityName.toKebabCase}.service.ts`;
          const filePath = path.join(directory, fileName);

          await fs.promises.mkdir(directory, {
               recursive: true,
          });
          await fs.promises.writeFile(filePath, content, "utf8");
     }

     async GenerateModule() {
          const directory = path.join(this.outputPath, "modules");

          const template = await ReadTemplate(
               path.join(projectRoot, "template/NestJS/TypeORM/module.txt"),
          );
          const content = this.replaceTemplate(template);
          const fileName = `${this.EntityName.toKebabCase}.module.ts`;
          const filePath = path.join(directory, fileName);

          await fs.promises.mkdir(directory, {
               recursive: true,
          });
          await fs.promises.writeFile(filePath, content, "utf8");
     }

     async GenerateController() {
          const directory = path.join(this.outputPath, "controllers");

          const template = await ReadTemplate(
               path.join(projectRoot, "template/NestJS/TypeORM/controller.txt"),
          );
          const content = this.replaceTemplate(template);
          const fileName = `${this.EntityName.toKebabCase}.controller.ts`;
          const filePath = path.join(directory, fileName);

          await fs.promises.mkdir(directory, {
               recursive: true,
          });
          await fs.promises.writeFile(filePath, content, "utf8");
     }

     async GenerateDBConnect() {
          const directory = path.join(this.outputPath, "configs");

          const content = await ReadTemplate(
               path.join(projectRoot, "template/NestJS/TypeORM/db-connect.txt"),
          );
          const fileName = "database.config.ts";
          const filePath = path.join(directory, fileName);

          await fs.promises.mkdir(directory, {
               recursive: true,
          });
          await fs.promises.writeFile(filePath, content, "utf8");
     }

     async GenerateTests() {
          const directory = path.join(this.outputPath, "tests");

          const serviceTestTemplate = await ReadTemplate(
               path.join(projectRoot, "template/NestJS/TypeORM/Tests/service.spec.txt"),
          );
          const serviceTestContent = this.replaceTemplate(serviceTestTemplate);
          const serviceTestFileName = `${this.EntityName.toKebabCase}.service.spec.ts`;
          const serviceTestFilePath = path.join(directory, serviceTestFileName);

          const controllerTestTemplate = await ReadTemplate(
               path.join(projectRoot, "template/NestJS/TypeORM/Tests/controller.spec.txt"),
          );
          const controllerTestContent = this.replaceTemplate(controllerTestTemplate);
          const controllerTestFileName = `${this.EntityName.toKebabCase}.controller.spec.ts`;
          const controllerTestFilePath = path.join(directory, controllerTestFileName);

          await fs.promises.mkdir(directory, {
               recursive: true,
          });
          await fs.promises.writeFile(serviceTestFilePath, serviceTestContent, "utf8");
          await fs.promises.writeFile(controllerTestFilePath, controllerTestContent, "utf8");

          await this.GenerateTsConfig();
          await this.GeneratePackageJson();
     }

     async GeneratePackageJson() {
          const pkgPath = path.join(this.outputPath, "package.json");

          // Read existing package.json if created by `crud NestJS create`
          let pkg = {};
          try {
               const existing = await fs.promises.readFile(pkgPath, "utf8");
               pkg = JSON.parse(existing);
          } catch {
               // No existing package.json — create from scratch
               pkg = {
                    name: this.EntityName.toKebabCase + "-api",
                    version: "1.0.0",
                    description: `CRUD API for ${this.EntityName.toPascalCase}`,
               };
          }

          // Ensure test scripts exist
          pkg.scripts = pkg.scripts || {};
          pkg.scripts.test = "node --require ts-node/register --test tests/*.spec.ts";
          pkg.scripts["test:service"] =
               `node --require ts-node/register --test tests/${this.EntityName.toKebabCase}.service.spec.ts`;
          pkg.scripts["test:controller"] =
               `node --require ts-node/register --test tests/${this.EntityName.toKebabCase}.controller.spec.ts`;

          // Ensure required dependencies
          const requiredDeps = {
               "@nestjs/common": "^10.0.0",
               "@nestjs/core": "^10.0.0",
               "@nestjs/platform-express": "^10.0.0",
               "@nestjs/typeorm": "^10.0.0",
               "@nestjs/config": "^3.0.0",
               "@nestjs/mapped-types": "^2.0.0",
               "class-validator": "^0.14.0",
               "class-transformer": "^0.5.1",
               typeorm: "^0.3.17",
               mysql2: "^3.15.0",
               "reflect-metadata": "^0.1.13",
               rxjs: "^7.8.0",
          };

          const requiredDevDeps = {
               "@nestjs/testing": "^10.0.0",
               supertest: "^6.3.0",
               "@types/supertest": "^2.0.0",
               "@types/node": "^20.0.0",
               "ts-node": "^10.9.0",
               typescript: "^6.0.0",
          };

          pkg.dependencies = { ...requiredDeps, ...pkg.dependencies };
          pkg.devDependencies = { ...requiredDevDeps, ...pkg.devDependencies };

          await fs.promises.writeFile(pkgPath, JSON.stringify(pkg, null, 2), "utf8");
     }

     async GenerateTsConfig() {
          const content = await ReadTemplate(
               path.join(projectRoot, "template/NestJS/TypeORM/tsconfig.txt"),
          );
          const filePath = path.join(this.outputPath, "tsconfig.json");
          await fs.promises.writeFile(filePath, content, "utf8");
     }

     replaceTemplate(template) {
          let primaryKeyType = this.csvData.metadata.entityMapped[this.primaryKey];
          // Map CSV types to valid TypeScript types
          if (
               primaryKeyType === "integer" ||
               primaryKeyType === "float" ||
               primaryKeyType === "decimal"
          ) {
               primaryKeyType = "number";
          }

          // Determine the appropriate pipe based on primary key type
          let primaryKeyPipe = "ParseIntPipe";
          if (primaryKeyType === "string") {
               primaryKeyPipe = "ParseUUIDPipe"; // or just remove the pipe for strings
          }

          const variables = {
               "{{EntityName}}": this.EntityName.toPascalCase,
               "{{FileName}}": this.EntityName.toKebabCase,
               "{{CamelCaseName}}": this.EntityName.toCamelCase,
               "{{PrimaryKeyField}}": this.primaryKey,
               "{{PrimaryKeyType}}": primaryKeyType,
               "{{PrimaryKeyPipe}}": primaryKeyPipe,
          };

          let content = String(template);

          for (const [placeholder, value] of Object.entries(variables)) {
               content = content.replace(
                    new RegExp(placeholder.replace(/[{}]/g, "\\$&"), "g"),
                    value,
               );
          }

          // Debug: console.log(`Generated Content: ${content}`);

          return content;
     }
}
