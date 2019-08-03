import { Options } from "./Options";

export interface CommandLineOptions extends Options {
    path: string;
    showVersion: boolean;
    showHelp: boolean;
}
