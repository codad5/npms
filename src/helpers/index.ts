const fs = require("fs");
const path = require("path");
const mainscript = process.argv[1];
const {exec} = require("child_process");
const mainscriptDir = path.dirname(mainscript);

export  async function listDirContents(filepath: string) {
  try {
    
    const detailedFilesPromises = await getallDirectory(filepath);
    
    const detailedFiles = await Promise.all(detailedFilesPromises);
    console.table(detailedFiles);
  } catch (error) {
    console.error("Error occurred while reading the directory!", error);
  }
}

const getallDirectory = async (filepath: any) => {
  const files = await fs.promises.readdir(filepath);
  const typepackage: { filename: string; }[] = []
  const detailedFilesPromises = files.map(async (file: string) => {
      let fileDetails = await fs.promises.lstat(path.resolve(filepath, file));
      const { size, birthtime } = fileDetails;
      let version = null
      // //console.log(file.includes("@"), file)
      if (fileDetails.isDirectory() && !file.includes("@") && !file.includes("node_modules") && !file.includes(".bin")) { 
        let packageJson =  await fs.promises.readFile(
          path.resolve(`${filepath}/${file}/`, "package.json"),
          "utf8"
          )
          version =  JSON.parse(packageJson).version
          return { filename: file, "size(KB)": size, created_at: birthtime, version };
        }
        if(file.includes("@")){
          //console.log('check')
          const typespath = await getallDirectory(`${filepath}/${file}`)
          let detailedFiles = await Promise.all(typespath);
          detailedFiles = detailedFiles.map(async (file: { filename: string; }) => {
            file.filename = `@types/${file.filename}`;
            // //console.log(file);
            return file;
          })
          detailedFiles = await Promise.all(detailedFiles);
          typepackage.push(...detailedFiles)
          console.table(typepackage)
        }
        return { filename: file, created_at: birthtime, version };
    });
    return [...detailedFilesPromises, ...typepackage]
    
}

export function createDir(filepath: string) {
  if (!fs.existsSync(filepath)) {
    fs.mkdirSync(filepath);
    //console.log("The directory has been created successfully");
  }
}

export function createFile(filepath: string) {
  fs.openSync(filepath, "w");
  //console.log("An empty file has been created");
}

// create a function to get current version form package.json
export function getVersion() {
    const packageJson = require("../../package.json");
    return packageJson.version;
    }

const getPackageVersion = (packageName: string) => {
  const pathtoPackagejson = `${mainscriptDir}/../node_modules/${packageName}/package.json`
  if(!fs.existsSync(pathtoPackagejson)) return null
  const {version} = require(pathtoPackagejson);
  //console.log(packageName, version, 'bro', pathtoPackagejson)
  return version;
}

export const changeVersion = (packages: string[], ) => {
  //console.log("Packages Found and Installed")
  const packageJson = require(`${process.cwd()}/package.json`);
  packages.map((packageName) => {
    const version = getPackageVersion(packageName);
    //console.log(`Installing ${packageName} @ version ${version}`);
    if(version) packageJson.dependencies[packageName] = `^${version}`;
  })
  //console.log(packageJson.dependencies)
  return packageJson
}

export const getDependencies = (packageName: any) => {
  const packageJson = require(`../../node_modules/${packageName}/package.json`);
  // //console.log(packageJson)
  return packageJson.dependencies || packageJson.peerDependencies ? [...Object.keys(packageJson.dependencies ?? {}), ...Object.keys(packageJson.peerDependencies ?? {})] : [ ]
}

export const allDependenciesFromPackagesindepth = (packages: string[]) => {
  return packages ? [...packages, ...packages.map((package_: string) => {
    const dependencies = [...getDependencies(package_)]
    console.log(`${package_} (Dependencies)`, dependencies)
    const deep = dependencies.map((dependency: string) => {
        const dependenciesOfDependencies = getDependencies(dependency);
        return [...dependenciesOfDependencies, dependency]
      })
      return deep.flat();
    })].flat() : [];
}

export const PrepPackages = async (packages: string[]) => {
  let packagesAndDep = packagesExist(packages) ? allDependenciesFromPackagesindepth(packages) : [];
  //console.log(packages)
  //console.log("packages and deps found =>" ,packagesAndDep)
  const packagesAndDepFullPath = packagesAndDep.map(value => `${mainscriptDir}/../node_modules/${value}`)
  return [packagesAndDepFullPath, packagesAndDep.flat()];
}

const packagesExist = (packages: string[]) => {
  return packages.map((package_: string) => {
      const packagePath = `${mainscriptDir}/../node_modules/${package_}`;
      if(!fs.existsSync(packagePath)) throw new Error(`${package_} is not installed offline`)
      return package_
    })
}