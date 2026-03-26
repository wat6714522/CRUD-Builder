#!/usr/bin/env node

import { Command } from "commander";
import { nestjs } from "./commands/NestJS/nestjs.js";
import { expressjs } from "./commands/ExpressJS/expressjs.js";
import { nextjs } from "./commands/NextJS/nextjs.js";

const program = new Command()
     .name("crud")
     .description("A CLI tool to build and generate all files necessary for CRUD operations")
     .version("1.0.4")
     .addCommand(nestjs)
     .addCommand(expressjs)
     .addCommand(nextjs);

program.parse();
