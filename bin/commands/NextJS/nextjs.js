import { Command } from "commander";
import { nextjsCreate } from "./create.js";
import { nextjsGenerate } from "./generate.js";
import { nextjsGenerateMultiple } from "./generate-multiple.js";
import { nextjsConnect } from "./connect.js";

export const nextjs = new Command("NextJS")
  .name("NextJS")
  .description("CLIs for NextJS")
  .version("1.0.0")
  .addCommand(nextjsCreate)
  .addCommand(nextjsGenerate)
  .addCommand(nextjsGenerateMultiple)
  .addCommand(nextjsConnect);
