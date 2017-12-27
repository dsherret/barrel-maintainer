# Barrel Maintainer

[![npm version](https://badge.fury.io/js/barrel-maintainer.svg)](https://badge.fury.io/js/barrel-maintainer)

Automatically maintains [barrels](https://angular.io/guide/glossary#barrel) in real-time.

## Installation

```bash
npm install -g barrel-maintainer
```

## Usage

```bash
barrel-maintainer [optional-path]
```

Arguments:

* `--singleQuotes` - Use single quotes instead of double.
* `--includeRootDir` - Create a barrel in the root directory.
* File extension for barrel (specify one)
    * `--ts` - Create index.ts files (default if there are more ts files in project)
    * `--js` - Create index.js files (default if there are more js files in project)
* New lines (specify one)
    * `--crlf` - Use carriage return line feed newlines (default on windows)
    * `--lf` - Use line feed newlines (default elsewhere)

## Ignoring Files

Add a `/* barrel:ignore */` statement to the file:

```ts
/* barrel:ignore */
export function log(message: string) {
    console.log(message);
}
```

## Api

```ts
import BarrelMaintainer from "barrel-maintainer";

const maintainer = new BarrelMaintainer("myProject/src/", {
    includeRootDir: false,
    fileExtension: "js", // or "ts" (extension for barrel)
    quoteType: "'", // or "\""
    newLineType: "\r\n" // or "\n"
});

await maintainer.updateDirectory("myProject/src/subdir");
const watcher = maintainer.watchDirectory("myProject/src");

// then later (if necessary)
watcher.stop();
```