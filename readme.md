# Barrel Maintainer

[![npm version](https://badge.fury.io/js/barrel-maintainer.svg)](https://badge.fury.io/js/barrel-maintainer)

Automatically maintains [barrels](https://angular.io/guide/glossary#barrel) in real-time.

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

## Disclaimer

This library will modify and delete source code. I am not responsible for any of its modifications or deletions!

Always use version control to verify and to be able to easily revert the changes it makes!
