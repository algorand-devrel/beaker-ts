#!/usr/bin/env -S npx tsx 

import { Command } from 'commander';
import { generateApplicationClient } from '.';

import * as fs from 'fs';
import * as path from 'path';

//const pjson = ../package.json'); // eslint-disable-line
const program = new Command();

program
  .name('beaker')
  .description('Utilities for working with beaker applications')
  .version('0.0.35');

// program
//   .command('init')
//   .description('initialize a directory for a beaker application')
//   .arguments('<path>')
//   .action((path)=>{
//     // check if path exists, bail 
// 
//     // check if python 3.10 is installed, bail
//     // create directory
//     // create contract dir
//     //  create virtual environment
//     //  install beaker-pyteal (or c# or reach)
//     //  create dummy app
// 
//     // install vite
// 
//     console.log(path)
// 
//   })

program
  .command('generate')
  .description('Generates an application client given an application spec')
  .arguments('<path-to-spec> <path-to-write>')
  .option('-l, --local', 'whether or not to use local import')
  .action((specPath, srcPath, options) => {
    if (srcPath.slice(-1) !== path.sep) srcPath += path.sep;

    if (!fs.lstatSync(srcPath).isDirectory()) {
      throw Error('Path argument must be a directory');
    }

    if (!fs.lstatSync(specPath).isFile()) {
      throw Error('Path to spec must be a file');
    }

    let jsonObj = JSON.parse(fs.readFileSync(specPath).toString());
    if (!('contract' in jsonObj)) {
      jsonObj = { hints: {}, source: {}, schema: {}, contract: jsonObj };
    }

    const outputFile = generateApplicationClient(
      jsonObj,
      options.local ? '../../src/' : undefined,
    );
    const name: string = jsonObj.contract.name;
    const file_name = `${name.toLowerCase()}_client.ts`;

    fs.writeFileSync(srcPath + file_name, outputFile);

    console.log(`Wrote client to: ${srcPath + file_name}`);
  });

program.parse();
