import { Command } from "commander";
import { generate } from "./generate.js";
import { create } from "./create.js";
import { dBconnect } from "./connect.js";

export const expressjs = new Command("ExpressJS")

     .name("ExpressJS")
     .description("CLIs for ExpressJS.")
     .addCommand(create)
     .addCommand(generate)
     .addCommand(dBconnect);
