import * as path from "path";
import * as os from "os";
import { CommandLineOptions } from "./CommandLineOptions";
import * as minimist from "minimist";

export function parseCommandLineArgs(args: string[]): CommandLineOptions {
    const argv = minimist(args, { boolean: true });

    return {
        path: getPath(),
        fileExtension: getFileExtension(),
        newLineType: getNewLineType(),
        quoteType: getQuoteType(),
        includeRootDir: argv.hasOwnProperty("includeRootDir"),
        showHelp: argv.hasOwnProperty("h") || argv.hasOwnProperty("help"),
        showVersion: argv.hasOwnProperty("v") || argv.hasOwnProperty("version")
    };

    function getPath() {
        if (argv._.length === 0)
            return path.resolve();
        const dirPath = argv._[0];
        return path.normalize(path.resolve(dirPath));
    }

    function getFileExtension() {
        const ts = "ts";
        const js = "js";
        if (argv.hasOwnProperty(ts) && argv.hasOwnProperty(js))
            throw new Error(`Cannot specify both a --${ts} and --${js} option.`);

        if (argv.hasOwnProperty(ts))
            return "ts";
        if (argv.hasOwnProperty(js))
            return "js";
        return undefined;
    }

    function getNewLineType() {
        const lf = "lf";
        const crlf = "crlf";
        if (argv.hasOwnProperty(lf) && argv.hasOwnProperty(crlf))
            throw new Error(`Cannot specify both a --${lf} and --${crlf} option.`);

        if (argv.hasOwnProperty(lf))
            return "\n";
        if (argv.hasOwnProperty(crlf))
            return "\r\n";
        return os.platform() === "win32" ? "\r\n" : "\n";
    }

    function getQuoteType() {
        const singleQuotes = "singleQuotes";
        const doubleQuotes = "doubleQuotes";
        if (argv.hasOwnProperty(singleQuotes) && argv.hasOwnProperty(doubleQuotes))
            throw new Error(`Cannot specify both a --${singleQuotes} and --${doubleQuotes} option.`);

        if (argv.hasOwnProperty(singleQuotes))
            return "'";
        if (argv.hasOwnProperty(doubleQuotes))
            return "\"";
        return undefined;
    }
}
