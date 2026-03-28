import fs from "fs";
import path from "path";

export async function ReadTemplate(templatePath) {
     if (!fs.existsSync(templatePath)) {
          throw new Error(`Template file not found: ${templatePath}`);
     }

     return await fs.promises.readFile(templatePath, "utf8");
}

export function toPascalCase(str) {
     return str
          .replace(/(?:^|[\s-_])(\w)/g, (_match, letter) => letter.toUpperCase())
          .replace(/[\s-_]/g, "");
}

export function toCamelCase(str) {
     const pascal = toPascalCase(str);

     return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

export function toKebabCase(str) {
     return str
          .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
          .replace(/[\s_]+/g, "-")
          .toLowerCase();
}

export function findFile(dir, fileName) {
     try {
          // Check if the file exists directly in the directory first
          const directPath = path.join(dir, fileName);
          if (fs.existsSync(directPath)) {
               return directPath;
          }

          // If not found directly, search recursively
          const files = fs.readdirSync(dir, { withFileTypes: true });

          for (const file of files) {
               const fullPath = path.join(dir, file.name);

               if (file.isDirectory()) {
                    const result = findFile(fullPath, fileName);
                    if (result) return result;
               } else if (file.name === fileName) {
                    return fullPath;
               }
          }
          return null;
     } catch (error) {
          // If we can't read the directory, return null
          return null;
     }
}

export async function createDirectoryIfNotExists(dirPath) {
     try {
          await fs.promises.mkdir(dirPath, { recursive: true });
     } catch (error) {
          if (error.code !== "EEXIST") {
               throw error;
          }
     }
}

export async function createFile(filePath, content) {
     try {
          const directory = path.dirname(filePath);
          await createDirectoryIfNotExists(directory);
          await fs.promises.writeFile(filePath, content, "utf8");
     } catch (error) {
          throw new Error(`Failed to create file ${filePath}: ${error.message}`);
     }
}

export async function readFile(filePath) {
     try {
          if (!fs.existsSync(filePath)) {
               throw new Error(`File not found: ${filePath}`);
          }
          return await fs.promises.readFile(filePath, "utf8");
     } catch (error) {
          throw new Error(`Failed to read file ${filePath}: ${error.message}`);
     }
}

export function toSnakeCase(str) {
     return str
          .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
          .replace(/[\s-]+/g, "_")
          .toLowerCase();
}

export function toTitleCase(str) {
     return str
          .toLowerCase()
          .split(/[\s-_]+/)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
}

export function toStartSentenceCase(str) {
     const cleaned = str.replace(/[\s-_]+/g, " ").toLowerCase();
     return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function toMiddleSentenceCase(str) {
     return str.replace(/[\s-_]+/g, " ").toLowerCase();
}

// Basic pluralization rules
const pluralizationRules = {
     irregulars: {
          person: "people",
          man: "men",
          woman: "women",
          child: "children",
          tooth: "teeth",
          foot: "feet",
          mouse: "mice",
          goose: "geese",
     },
     endings: [
          { pattern: /(s|ss|sh|ch|x|z)$/i, replacement: "$1es" },
          { pattern: /([^aeiou])y$/i, replacement: "$1ies" },
          { pattern: /([aeiou])y$/i, replacement: "$1ys" },
          { pattern: /(f|fe)$/i, replacement: "ves" },
          { pattern: /([^f])f$/i, replacement: "$1ves" },
          { pattern: /(o)$/i, replacement: "$1es" },
          { pattern: /$/i, replacement: "s" },
     ],
};

// Helper function to check if a word is already plural
function isPlural(str) {
     const lower = str.toLowerCase();

     // Check if it's already an irregular plural
     for (const plural of Object.values(pluralizationRules.irregulars)) {
          if (plural === lower) {
               return true;
          }
     }

     // Common plural endings
     return (
          (str.endsWith("s") && str.length > 1 && !str.endsWith("ss")) ||
          str.endsWith("es") ||
          str.endsWith("ies") ||
          str.endsWith("ves")
     );
}

export function toPlural(str) {
     const lower = str.toLowerCase();

     // Check if already plural (common patterns)
     if (isPlural(str)) {
          return str;
     }

     // Check irregular forms
     if (pluralizationRules.irregulars[lower]) {
          const irregular = pluralizationRules.irregulars[lower];
          return str === str.toLowerCase()
               ? irregular
               : str === str.toUpperCase()
                 ? irregular.toUpperCase()
                 : irregular.charAt(0).toUpperCase() + irregular.slice(1);
     }

     // Apply pattern-based rules
     for (const rule of pluralizationRules.endings) {
          if (rule.pattern.test(str)) {
               return str.replace(rule.pattern, rule.replacement);
          }
     }

     return str + "s";
}

export function toSingular(str) {
     const lower = str.toLowerCase();

     // Check reverse irregular forms
     for (const [singular, plural] of Object.entries(pluralizationRules.irregulars)) {
          if (plural === lower) {
               return str === str.toLowerCase()
                    ? singular
                    : str === str.toUpperCase()
                      ? singular.toUpperCase()
                      : singular.charAt(0).toUpperCase() + singular.slice(1);
          }
     }

     // Simple rules for common patterns
     if (str.endsWith("ies")) {
          return str.slice(0, -3) + "y";
     }
     if (str.endsWith("ves")) {
          return str.slice(0, -3) + "f";
     }
     if (str.endsWith("es") && !str.endsWith("oes")) {
          return str.slice(0, -2);
     }
     if (str.endsWith("s") && str.length > 1) {
          return str.slice(0, -1);
     }

     return str;
}
