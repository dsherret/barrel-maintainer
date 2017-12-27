#!/usr/bin/env node

import * as path from "path";
import {PublicApi} from "./PublicApi";
import minimist from "minimist";

const cwdPath = path.resolve();
const argv = minimist(process.argv.slice(2));
const api = new PublicApi(cwdPath, {
    quoteType: argv.hasOwnProperty("singleQuotes") ? "'" : "\"",
    fileExtension: argv.hasOwnProperty("fileExtension") ? argv["fileExtension"] : undefined,
    includeRootDir: argv.hasOwnProperty("includeRootDir")
});

api.watchDirectory(cwdPath);
