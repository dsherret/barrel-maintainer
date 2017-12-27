# Barrel Maintainer

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
* File extension for barrel (defaults to what's being used most in the project)
    * `--ts` - Create index.ts files.
    * `--js` - Create index.js files.
* New lines (default to --crlf on windows and --lf elsewhere)
    * `--crlf` - Use carriage return line feed newlines.
    * `--lf` - Use line feed newlines.

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