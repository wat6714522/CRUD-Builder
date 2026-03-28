import { Command } from "commander";
import { dBconnect } from "./connect.js";
import { generate } from "./generate.js";
import { create } from "./create.js";

export const nestjs = new Command("NestJS")
     .name("NestJS")
     .description("CLIs for NestJS.")
     .addCommand(create)
     .addCommand(generate)
     .addCommand(dBconnect);
