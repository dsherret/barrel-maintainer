#!/usr/bin/env node

import * as path from "path";
import * as os from "os";
import {PublicApi} from "./PublicApi";
import {parseCommandLineArgs} from "./parseCommandLineArgs";

const args = parseCommandLineArgs(process.argv.slice(2));
const watchPath = args.path;
const api = new PublicApi(watchPath, args);

console.log(`Updating directory ${watchPath}...`);
api.updateDirectory(watchPath);
console.log(`Watching files in ${watchPath}...`);
api.watchDirectory(watchPath);
