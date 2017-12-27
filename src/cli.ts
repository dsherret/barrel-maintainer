#!/usr/bin/env node

import * as path from "path";
import * as os from "os";
import {PublicApi} from "./PublicApi";
import * as minimist from "minimist";

const argv = minimist(process.argv.slice(2));
const watchPath = getPath();
const api = new PublicApi(watchPath, {
    fileExtension: getFileExtension(),
    newLineType: getNewLineType(),
    quoteType: argv.hasOwnProperty("singleQuotes") ? "'" : "\"",
    includeRootDir: argv.hasOwnProperty("includeRootDir")
});

console.log(`Updating directory ${watchPath}...`);
api.updateDirectory(watchPath);
console.log(`Watching files in ${watchPath}...`);
api.watchDirectory(watchPath);

function getPath() {
    if (argv._.length === 0)
        return path.resolve();
    const dirPath = argv._[0];
    return path.normalize(path.resolve(dirPath));
}

function getFileExtension() {
    if (argv.hasOwnProperty("ts") && argv.hasOwnProperty("js"))
        throw new Error("Cannot specify both a --ts and --js option.");

    if (argv.hasOwnProperty("ts"))
        return "ts";
    if (argv.hasOwnProperty("js"))
        return "js";
    return undefined;
}

function getNewLineType() {
    if (argv.hasOwnProperty("crlf") && argv.hasOwnProperty("lf"))
        throw new Error("Cannot specify both a --crlf and --lf option.");

    if (argv.hasOwnProperty("crlf"))
        return "\r\n";
    if (argv.hasOwnProperty("lf"))
        return "\n";
    return os.platform() === "win32" ? "\r\n" : "\n";
}
