# Barrel Maintainer

[![npm version](https://badge.fury.io/js/barrel-maintainer.svg)](https://badge.fury.io/js/barrel-maintainer)

Automatically maintains [barrels](https://basarat.gitbooks.io/typescript/docs/tips/barrel.html) in real-time.

[![Automated real-time barrel maintenance](https://github.com/dsherret/barrel-maintainer/raw/master/demo.gif)](https://youtu.be/gFi7kQnD69k)

[Video Overview](https://youtu.be/gFi7kQnD69k)

## Installation

```bash
npm install -g barrel-maintainer
```

## Usage

```bash
barrel-maintainer [options] [path]
```

Options:

* `--includeRootDir` - Create a barrel in the root directory.
* Quote type (specify one)
    * Defaults to the quote type used in the first found import declaration in your project.
    * `--singleQuotes` - Use single quotes.
    * `--doubleQuotes` - Use double quotes.
* File extension for barrel (specify one)
    * Defaults to whichever file type your project has more of.
    * `--ts` - Create index.ts files.
    * `--js` - Create index.js files.
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

## Exporting a Subset of a File's Exports

Given the following setup:

```js
// classes.js
export ClassA {}
export ClassB {}

// index.js
export * from "./classes";
```

If you want the barrel to export a subset of the exports from *classes.js*, then edit the barrel to say so:

```js
// index.js
export {ClassA} from "./classes";
```

These kind of changes won't be overwritten by the code manipulation.

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

## About

This project uses [ts-simple-ast](https://github.com/dsherret/ts-simple-ast) to navigate and manipulate source code.

## Disclaimer

This library will modify and delete source code. I am not responsible for any of its modifications or deletions!

Always use version control to verify and to be able to easily revert the changes it makes!
