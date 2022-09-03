#!/usr/bin/env node

import { Command } from "commander";
import { generateApplicationClient } from ".";

import * as fs from "fs";
import * as path from "path";

const pjson = require("../package.json")

const program = new Command();

program
  .name("beaker")
  .description("Utilities for working with beaker applications")
  .version(pjson['version']);

program
  .command("generate")
  .description("Generates an application client given an application spec")
  .arguments("<path-to-spec> <path-to-write>")
  .option("-l, --local", "whether or not to use local import")
  .action((specPath, srcPath, options) => {
    const importPath = options.local?'../../src/':undefined

    if (srcPath.slice(-1) !== path.sep) srcPath += path.sep;

    if (!fs.lstatSync(srcPath).isDirectory()) {
      throw Error("Path argument must be a directory");
    }

    if (!fs.lstatSync(specPath).isFile()) {
      throw Error("Path to spec must be a file");
    }

    console.log(`Writing client to: ${srcPath}`)

    generateApplicationClient(
      JSON.parse(fs.readFileSync(specPath).toString()),
      srcPath,
      importPath 
    );
  })

program.parse()