#! /usr/bin/env node

import { createDir, createFile, getVersion, listDirContents,  changeVersion, getDependencies, allDependenciesFromPackagesindepth, PrepPackages } from "./helpers";

const { Command } = require("commander");
const figlet = require("figlet");
const fs = require("fs");
const path = require("path");
const {exec} = require("child_process");
const program = new Command();
const mainscript = process.argv[1];
const mainscriptDir = path.dirname(mainscript);
console.log(figlet.textSync("NPM OFFLINE SAVER"));

program
  .name('NPMSO (Install Npm package offline')
  .version(getVersion())
  .description("A package to store npm package offline")
  .option("-l, --ls", "List all packages offline")
  .option("-i, --install", "Install a package(s)")
  .option("-s, --save  <value...>", "Install a package(s) for offline use")
  .option("-u, --use <value...>", "Install a offline package to a specific node project directory")
  .option("-up, --update [value...]", "Update a specific package or all package")
  .option("-rm, --remove <value...>", "Update a specific package or all package")
  .parse(process.argv);

const options = program.opts();
// console.log(options, process.argv, mainscriptDir)
if (options.ls) {
  listDirContents(`${mainscriptDir}/../node_modules`);
}

if (options.save) {
    const packages = options.save;
    // const commands = `npm install ${package_} --prefix ${filepath} && npm i ${package_}`
    let commands = `npm install ${packages.join(" ")} --prefix ${mainscriptDir}/../`
    if(options.install) commands += ` && npm i ${packages.join(" ")}`
    console.log('npms > '+commands)
    exec(commands, (err: any, stdout: any, stderr: any) => {
        if (err) return console.log(err);
        console.log(stdout);
    });
}

// add the following code
if (options.use) {
  console.time('Save packages in')
  try {
    //  && npm cache clean --force
    if(!fs.existsSync(`${process.cwd()}/package.json`)) throw new Error('No package.json file found in the directory')
    const packages = options.use;
    PrepPackages(packages)
    .then(packagesAndDep => {
      console.log('==============================')
      console.log('Packages and dependencies')
      console.table(packagesAndDep[1])
      const commands = `npm install ${packagesAndDep[0].join(" ")} --offline`
      return commands
      
    })
    .then(commands => 
      exec(`${commands}`, (err: any, stdout: any, stderr: any) => {
        if (err) return console.log(err);
        console.log(stdout);
        console.log("packages installed, ===> ", packages)
        const packageJson =  changeVersion(packages)
        fs.writeFileSync(`${process.cwd()}/package.json`, JSON.stringify(packageJson, null, 2));
        console.timeEnd('Save packages in')
      })
      ).catch(err => console.log(err))
      
  }
  catch (error) {
    console.log(error)
  }
}


if (options.update) {
  const packages = options.update.length > 0 ? options.update : []
  console.log(packages)
  exec(`npm update ${packages.join(" ")}`, (err, stdout, stderr) => {
    if(err) return console.log(err)
    console.log(stdout)
  })
}
if (options.remove) {
  const packages = options.remove
  console.log(packages)
  exec(`cd ${mainscriptDir} && npm uninstall ${packages.join(" ")} && cd ${process.cwd()}`, (err, stdout, stderr) => {
    if(err) return console.log(err)
    console.log(stdout)
  })
}

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
