import {getPackageVersion} from "./getPackageVersion";

export function getHelpText() {
    // I used tsc --help as an example template for this
    return `Version ${getPackageVersion()}
Syntax:   barrel-maintainer [options] [path]

Examples: barrel-maintainer
          barrel-maintainer src
          barrel-maintainer --includeRootDir src
          barrel-maintainer --singleQuotes --ts --crlf --includeRootDir src

Options:
-h, --help                      Output this message.
-v, --version                   Output the version.
--includeRootDir                Specify to create a barrel in the root directory.
--singleQuotes, --doubleQuotes  Force the kind of quotes to use (defaults to what's used in the project)
--ts, --js                      Force the file type to use for barrel index files (defaults to what's used most in the project)
--crlf, --lf                    Force the line ending kind to use (defaults to crlf on windows and lf on linux)

Ignoring files:

Add a /* barrel:ignore */ comment to the file.
`;
}