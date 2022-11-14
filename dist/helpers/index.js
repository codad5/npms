"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrepPackages = exports.allDependenciesFromPackagesindepth = exports.getDependencies = exports.changeVersion = exports.getVersion = exports.createFile = exports.createDir = exports.listDirContents = void 0;
const fs = require("fs");
const path = require("path");
const mainscript = process.argv[1];
const { exec } = require("child_process");
const mainscriptDir = path.dirname(mainscript);
function listDirContents(filepath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const detailedFilesPromises = yield getallDirectory(filepath);
            const detailedFiles = yield Promise.all(detailedFilesPromises);
            console.table(detailedFiles);
        }
        catch (error) {
            console.error("Error occurred while reading the directory!", error);
        }
    });
}
exports.listDirContents = listDirContents;
const getallDirectory = (filepath) => __awaiter(void 0, void 0, void 0, function* () {
    const files = yield fs.promises.readdir(filepath);
    const typepackage = [];
    const detailedFilesPromises = files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
        let fileDetails = yield fs.promises.lstat(path.resolve(filepath, file));
        const { size, birthtime } = fileDetails;
        let version = null;
        // //console.log(file.includes("@"), file)
        if (fileDetails.isDirectory() && !file.includes("@") && !file.includes("node_modules") && !file.includes(".bin")) {
            let packageJson = yield fs.promises.readFile(path.resolve(`${filepath}/${file}/`, "package.json"), "utf8");
            version = JSON.parse(packageJson).version;
            return { filename: file, "size(KB)": size, created_at: birthtime, version };
        }
        if (file.includes("@")) {
            //console.log('check')
            const typespath = yield getallDirectory(`${filepath}/${file}`);
            let detailedFiles = yield Promise.all(typespath);
            detailedFiles = detailedFiles.map((file) => __awaiter(void 0, void 0, void 0, function* () {
                file.filename = `@types/${file.filename}`;
                // //console.log(file);
                return file;
            }));
            detailedFiles = yield Promise.all(detailedFiles);
            typepackage.push(...detailedFiles);
            console.table(typepackage);
        }
        return { filename: file, created_at: birthtime, version };
    }));
    return [...detailedFilesPromises, ...typepackage];
});
function createDir(filepath) {
    if (!fs.existsSync(filepath)) {
        fs.mkdirSync(filepath);
        //console.log("The directory has been created successfully");
    }
}
exports.createDir = createDir;
function createFile(filepath) {
    fs.openSync(filepath, "w");
    //console.log("An empty file has been created");
}
exports.createFile = createFile;
// create a function to get current version form package.json
function getVersion() {
    const packageJson = require("../../package.json");
    return packageJson.version;
}
exports.getVersion = getVersion;
const getPackageVersion = (packageName) => {
    const pathtoPackagejson = `${mainscriptDir}/../node_modules/${packageName}/package.json`;
    if (!fs.existsSync(pathtoPackagejson))
        return null;
    const { version } = require(pathtoPackagejson);
    //console.log(packageName, version, 'bro', pathtoPackagejson)
    return version;
};
const changeVersion = (packages) => {
    //console.log("Packages Found and Installed")
    const packageJson = require(`${process.cwd()}/package.json`);
    packages.map((packageName) => {
        const version = getPackageVersion(packageName);
        //console.log(`Installing ${packageName} @ version ${version}`);
        if (version)
            packageJson.dependencies[packageName] = `^${version}`;
    });
    //console.log(packageJson.dependencies)
    return packageJson;
};
exports.changeVersion = changeVersion;
const getDependencies = (packageName) => {
    var _a, _b;
    const packageJson = require(`../../node_modules/${packageName}/package.json`);
    // //console.log(packageJson)
    return packageJson.dependencies || packageJson.peerDependencies ? [...Object.keys((_a = packageJson.dependencies) !== null && _a !== void 0 ? _a : {}), ...Object.keys((_b = packageJson.peerDependencies) !== null && _b !== void 0 ? _b : {})] : [];
};
exports.getDependencies = getDependencies;
const allDependenciesFromPackagesindepth = (packages) => {
    return packages ? [...packages, ...packages.map((package_) => {
            const dependencies = [...(0, exports.getDependencies)(package_)];
            console.log(`${package_} (Dependencies)`, dependencies);
            const deep = dependencies.map((dependency) => {
                const dependenciesOfDependencies = (0, exports.getDependencies)(dependency);
                return [...dependenciesOfDependencies, dependency];
            });
            return deep.flat();
        })].flat() : [];
};
exports.allDependenciesFromPackagesindepth = allDependenciesFromPackagesindepth;
const PrepPackages = (packages) => __awaiter(void 0, void 0, void 0, function* () {
    let packagesAndDep = packagesExist(packages) ? (0, exports.allDependenciesFromPackagesindepth)(packages) : [];
    //console.log(packages)
    //console.log("packages and deps found =>" ,packagesAndDep)
    const packagesAndDepFullPath = packagesAndDep.map(value => `${mainscriptDir}/../node_modules/${value}`);
    return [packagesAndDepFullPath, packagesAndDep.flat()];
});
exports.PrepPackages = PrepPackages;
const packagesExist = (packages) => {
    return packages.map((package_) => {
        const packagePath = `${mainscriptDir}/../node_modules/${package_}`;
        if (!fs.existsSync(packagePath))
            throw new Error(`${package_} is not installed offline`);
        return package_;
    });
};
//# sourceMappingURL=index.js.map