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

export default class NextJS {
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
     }

     async Initialize() {
          this.csvData = await readFile(this.csvPath);
          // Filter out invalid field names (like _10, _11 from CSV parsing errors)
          this.fields = this.csvData.fields.filter((field) => this.isValidFieldName(field));
          this.primaryKey = this.csvData.metadata.primaryKeyField;

          const entityName = path.basename(this.csvPath, ".csv");
          this.EntityName = {
               toPascalCase: toPascalCase(entityName),
               toCamelCase: toCamelCase(entityName),
               toKebabCase: toKebabCase(entityName),
          };
     }

     // Validate field names for Prisma compatibility
     isValidFieldName(fieldName) {
          // Filter out fields that start with underscore followed by numbers (like _10, _11)
          if (/^_\d+$/.test(fieldName)) {
               console.warn(`⚠️  Skipping invalid field name: ${fieldName}`);
               return false;
          }

          // Filter out empty or null field names
          if (!fieldName || fieldName.trim() === "") {
               console.warn(`⚠️  Skipping empty field name`);
               return false;
          }

          // Field names starting with dots are invalid
          if (fieldName.startsWith(".")) {
               console.warn(`⚠️  Skipping field starting with dot: ${fieldName}`);
               return false;
          }

          return true;
     }

     async GenerateComponent() {
          const component = String(this.component);

          switch (component) {
               case "schema":
                    return await this.GeneratePrismaSchema();
               case "api":
                    return await this.GenerateApiRoutes();
               case "server_actions":
                    return await this.GenerateServerAction();
               case "all":
                    // Generate all components and wait for completion
                    await this.GeneratePrismaSchema();
                    await this.GenerateApiRoutes();
                    await this.GenerateServerAction();

                    return {
                         Schema: "✅ Generated",
                         Api: "✅ Generated",
                         Server: "✅ Generated",
                    };
               default:
                    throw new Error(`Unsupport Component: ${component}`);
          }
     }

     async GeneratePrismaSchema() {
          // Skip generating schema for hidden files or invalid entities
          if (
               this.EntityName.toKebabCase.startsWith("._") ||
               this.EntityName.toKebabCase.startsWith(".")
          ) {
               console.warn(
                    `⚠️  Skipping schema generation for hidden entity: ${this.EntityName.toKebabCase}`,
               );
               return;
          }

          const template = await ReadTemplate(
               path.join(projectRoot, "template/NextJS/PrismaORM/Prisma/schema.txt"),
          );

          const fileName = "schema.prisma";
          const filePath = path.join(`${this.outputPath}/prisma`, fileName);
          const prismaDir = path.join(this.outputPath, "prisma");

          await fs.promises.mkdir(prismaDir, { recursive: true });

          // Check if schema.prisma already exists
          if (fs.existsSync(filePath)) {
               // Read existing schema and append new model
               const existingSchema = await fs.promises.readFile(filePath, "utf8");
               const newModel = this.generatePrismaModel();

               // Check if this model already exists in the schema
               if (!existingSchema.includes(`model ${this.EntityName.toPascalCase}{`)) {
                    // Ensure schema has generator and datasource blocks
                    let updatedSchema;
                    if (
                         !existingSchema.includes("generator client") &&
                         !existingSchema.includes("datasource db")
                    ) {
                         // Schema is missing header blocks, recreate completely
                         const headerBlocks = this.getSchemaHeaders();
                         const existingModels = this.extractModelsFromSchema(existingSchema);
                         updatedSchema = headerBlocks + "\n\n" + existingModels + "\n\n" + newModel;
                    } else {
                         // Just append the new model
                         updatedSchema = existingSchema + "\n\n" + newModel;
                    }

                    await fs.promises.writeFile(filePath, updatedSchema, "utf8");
                    console.info(
                         `✅ Added ${this.EntityName.toPascalCase} model to existing schema`,
                    );
               } else {
                    console.info(
                         `⚠️  Model ${this.EntityName.toPascalCase} already exists in schema`,
                    );
               }
          } else {
               // Create new schema with generator and datasource
               const templateContent = this.replacePrismaTemplate(template);
               await fs.promises.writeFile(filePath, templateContent, "utf8");
               console.info(`✅ Created new schema with ${this.EntityName.toPascalCase} model`);
          }
     }

     GeneratePrismaProperties() {
          return this.fields
               .map((field) => {
                    const sampleValue = this.csvData.records[0]?.[field];
                    const type = this.csvData.metadata.entityMapped[field];
                    const isPrimaryKey = field === this.primaryKey;

                    let prismaType;
                    let attributes = [];

                    if (isPrimaryKey) {
                         prismaType = "Int";
                         attributes.push("@id", "@default(autoincrement())");
                    }

                    switch (type) {
                         case "string":
                              prismaType = "String";
                              field.toLowerCase().includes("email")
                                   ? attributes.push("@unique")
                                   : null;
                              break;
                         case "number":
                              prismaType = sampleValue?.toString().includes(".") ? "Float" : "Int";
                              break;
                         case "boolean":
                              prismaType = "Boolean";
                              break;
                         case "date":
                              prismaType = "DateTime";
                              break;
                         default:
                              throw new Error(`Unsupport type: ${type}`);
                              break;
                    }

                    const atributeString = attributes.length > 0 ? ` ${attributes.join("")}` : "";
                    return `  ${field}    ${prismaType}${atributeString}`;
               })
               .join("\n");
     }

     replacePrismaTemplate(template) {
          const variables = {
               "{{EntityName}}": this.EntityName.toPascalCase,
               "{{EntityProperties}}": this.GeneratePrismaProperties(),
               "{{TableName}}": this.EntityName.toKebabCase,
          };

          let content = String(template);

          for (const [placeholder, value] of Object.entries(variables)) {
               content = content.replace(
                    new RegExp(placeholder.replace(/[{}]/g, "\\$&"), "g"),
                    value,
               );
          }

          console.info(`Generate Prisma Content: \n
            ${content}`);

          return content;
     }

     generatePrismaModel() {
          const properties = this.GeneratePrismaProperties();
          return `model ${this.EntityName.toPascalCase}{
${properties}
    @@map("${this.EntityName.toKebabCase}")
}`;
     }

     // Get schema headers (generator and datasource blocks)
     getSchemaHeaders() {
          return `generator client{
    provider = "prisma-client-js"
}

datasource db{
    provider = "mysql"
    url = env("DATABASE_URL")
}`;
     }

     // Extract only model blocks from schema content
     extractModelsFromSchema(schemaContent) {
          const models = [];
          const lines = schemaContent.split("\n");
          let inModel = false;
          let currentModel = [];
          let braceCount = 0;

          for (const line of lines) {
               if (line.trim().startsWith("model ")) {
                    inModel = true;
                    currentModel = [line];
                    braceCount =
                         (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
               } else if (inModel) {
                    currentModel.push(line);
                    braceCount +=
                         (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;

                    if (braceCount === 0) {
                         models.push(currentModel.join("\n"));
                         inModel = false;
                         currentModel = [];
                    }
               }
          }

          return models.join("\n\n");
     }

     async GenerateApiRoutes() {
          // Skip generating API routes for hidden files or invalid entities
          if (
               this.EntityName.toKebabCase.startsWith("._") ||
               this.EntityName.toKebabCase.startsWith(".")
          ) {
               console.warn(
                    `⚠️  Skipping API routes generation for hidden entity: ${this.EntityName.toKebabCase}`,
               );
               return;
          }

          const routeDirectory = path.join(
               this.outputPath,
               "src",
               "app",
               "api",
               this.EntityName.toKebabCase,
          );
          const idRouteDirectory = path.join(routeDirectory, "[id]");

          const routeTemplate = await ReadTemplate(
               path.join(projectRoot, "template/NextJS/PrismaORM/api/route.txt"),
          );
          const idRouteTemplate = await ReadTemplate(
               path.join(projectRoot, "template/NextJS/PrismaORM/api/idRoute.txt"),
          );

          const routeContent = this.replaceApiTemplate(routeTemplate, false);
          const idRouteContent = this.replaceApiTemplate(idRouteTemplate, true);

          const routeFilePath = path.join(routeDirectory, "route.ts");
          const idRouteFilePath = path.join(idRouteDirectory, "route.ts");

          await fs.promises.mkdir(routeDirectory, { recursive: true });
          await fs.promises.mkdir(idRouteDirectory, { recursive: true });

          await fs.promises.writeFile(routeFilePath, routeContent, "utf8");
          await fs.promises.writeFile(idRouteFilePath, idRouteContent, "utf8");
     }

     generateDataFields() {
          return this.fields.filter((field) => field !== this.primaryKey).join(", ");
     }

     generateDataFieldAssignments() {
          return this.fields
               .filter((field) => field !== this.primaryKey)
               .map((field) => `                ${field}`)
               .join(",\n");
     }

     replaceApiTemplate(template, isIdRoute) {
          const variables = {
               "{{EntityName}}": this.EntityName.toPascalCase,
               "{{CamelCaseName}}": this.EntityName.toCamelCase,
               "{{KebabCaseName}}": this.EntityName.toKebabCase,
               "{{PrimaryKey}}": this.primaryKey,
               "{{ModelName}}": this.EntityName.toCamelCase,
               "{{ModelNames}}": this.EntityName.toCamelCase + "s",
               "{{DataFields}}": this.generateDataFields(),
               "{{DataFieldAssignments}}": this.generateDataFieldAssignments(),
          };

          let content = String(template);

          for (const [placeholder, value] of Object.entries(variables)) {
               content = content.replace(
                    new RegExp(placeholder.replace(/[{}]/g, "\\$&"), "g"),
                    value,
               );
          }

          console.info(`Generate API Content: \n
            ${content}`);

          return content;
     }

     async GenerateServerAction() {
          // Skip generating server actions for hidden files or invalid entities
          if (
               this.EntityName.toKebabCase.startsWith("._") ||
               this.EntityName.toKebabCase.startsWith(".")
          ) {
               console.warn(
                    `⚠️  Skipping server action generation for hidden entity: ${this.EntityName.toKebabCase}`,
               );
               return;
          }

          const actionTemplate = await ReadTemplate(
               path.join(projectRoot, "template/NextJS/PrismaORM/action/server.txt"),
          );

          const actionContent = this.replaceApiTemplate(actionTemplate, false);
          const actionFilePath = path.join(
               this.outputPath,
               "lib",
               "actions",
               `${this.EntityName.toKebabCase}.ts`,
          );

          await fs.promises.mkdir(path.join(this.outputPath, "lib", "actions"), {
               recursive: true,
          });
          await fs.promises.writeFile(actionFilePath, actionContent, "utf8");
     }

     async GeneratePrismaClientManager() {
          const prismaClientFilePath = path.join(this.outputPath, "lib/prisma.ts");

          // Check if Prisma client file already exists
          if (fs.existsSync(prismaClientFilePath)) {
               console.info(`ℹ️  Prisma client manager already exists at: ${prismaClientFilePath}`);
               return;
          }

          const prismaClientTemplate = await ReadTemplate(
               path.join(projectRoot, "template/NextJS/PrismaORM/lib/prisma.txt"),
          );

          await fs.promises.mkdir(path.join(this.outputPath, "lib"), {
               recursive: true,
          });
          await fs.promises.writeFile(prismaClientFilePath, prismaClientTemplate, "utf8");

          console.info(`✅ Generated Prisma client manager at: ${prismaClientFilePath}`);
     }
}
