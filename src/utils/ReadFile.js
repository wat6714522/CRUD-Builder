import csvParser from "csv-parser";
import fs from "fs";

export default async function readFile(filePath) {
     try {
          if (!fs.existsSync(filePath)) {
               throw new Error(`File not found: ${filePath}`);
          }

          const data = await parseCSV(filePath);

          return data;
     } catch (error) {
          throw new Error(`${error.message}`);
     }
}

function parseCSV(filePath, encoding = "utf8") {
     return new Promise((resolve, reject) => {
          const results = {
               records: [],
               fields: [],
               metadata: {
                    data: {},
                    entityMapped: {},
                    primaryKeyField: "",
                    totalRecords: 0,
               },
          };
          const record = {};

          let isFirstRow = true;

          fs.createReadStream(filePath, { encoding })
               .pipe(csvParser({ trim: true, skip_empty_lines: true }))
               .on("data", (row) => {
                    // csv-parser automatically handles headers, so every row here is a data row
                    // Initialize fields and columns on first data row
                    if (isFirstRow) {
                         results.fields = Object.keys(row);
                         results.metadata.primaryKeyField = Object.keys(row)[0];

                         // Infer types from the first row only
                         Object.keys(row).forEach((field) => {
                              const value = row[field];
                              const typedValue = mapValueToType(value);
                              const mapEntity = mapToEntity(typedValue);
                              results.metadata.entityMapped[field] = mapEntity;
                         });

                         isFirstRow = false;
                    }

                    // Process the data row
                    const record = {};

                    Object.keys(row).forEach((field) => {
                         const value = row[field];
                         const typedValue = mapValueToType(value);
                         record[field] = typedValue;
                    });

                    const primaryKey = record[results.metadata.primaryKeyField];

                    if (primaryKey !== null && primaryKey !== undefined) {
                         results.metadata.data[primaryKey] = record;
                         results.records.push(record);
                         results.metadata.totalRecords++;
                    }
               })
               .on("error", (error) => {
                    reject(new Error(`${error.message}`));
               })
               .on("end", () => {
                    console.log(`${results.metadata.entityMapped}`);
                    resolve(results);
               });
     });
}

function mapToEntity(values) {
     switch (values) {
          case "string":
               return "string";
          case "integer":
               return "integer";
          case "float":
               return "float";
          case "decimal":
               return "decimal";
          case "boolean":
               return "boolean";
          case "date":
               return "date";
          case "":
               return "null";
          default:
               throw new Error(`Unsupported type: ${values}`);
     }
}

function mapValueToType(value) {
     if (value == null || value == undefined || value.trim() == "") {
          return "";
     }

     const trimmedValue = value.trim();
     if (trimmedValue.toLowerCase() == "true" || trimmedValue.toLowerCase() == "false") {
          return "";
     }

     if (!isNaN(Number(trimmedValue)) && !isNaN(parseFloat(trimmedValue))) {
          if (trimmedValue.includes(".")) {
               const decimalPart = trimmedValue.split(".")[1];
               if (decimalPart && decimalPart.length > 2) {
                    return "decimal";
               } else {
                    return "float";
               }
          } else {
               return "integer";
          }
     }

     if (!isNaN(new Date(trimmedValue).getTime())) {
          return "date";
     }

     return "string";
}
