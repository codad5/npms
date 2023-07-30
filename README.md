# NPM Offline Saver (npms)

## Description

NPM Offline Saver (npms) is a Node.js command-line application built for learning purposes. It provides a way to store npm packages offline, allowing you to install and manage packages without an internet connection. The application utilizes the `--offline` flag of npm to achieve this functionality.

Please note that this project is now archived on GitHub and is no longer actively maintained. You can find the archived repository at the following link: [GitHub.com/codad5/npms](https://GitHub.com/codad5/npms)

## Installation

Since the project was never uploaded to the npm registry, you need to install it manually. After cloning the repository, navigate to the project directory in your command-line interface (CLI) and run the following commands to build the application and then install it globally on your system:

```
npm run build
npm i -g .
```

## Usage

Once installed, you can use the `npms` command in your terminal to interact with the application.

### Available Options:

- `-l, --ls`: List all packages stored offline.
- `-i, --install`: Install packages specified with the `--save` option.
- `-s, --save <value...>`: Install package(s) for offline use.
- `-u, --use <value...>`: Install an offline package to a specific node project directory.
- `-up, --update [value...]`: Update a specific package or all packages.
- `-rm, --remove <value...>`: Uninstall a specific package or all packages.

Please note that some options may require additional parameters to execute the desired action.

## Example Usage

1. List all packages stored offline:

```
npms -l
```

2. Install packages for offline use:

```
npms -s package1 package2 package3
```

3. Install offline packages to a specific node project directory:

```
npms -u package1 package2 package3
```

4. Update packages:

```
npms -up package1 package2
```

5. Remove packages:

```
npms -rm package1 package2
```

If you run the `npms` command without any options, the application's help information will be displayed.

Please note that this project was built for learning purposes, and npm already has a similar feature using the `--offline` flag.
