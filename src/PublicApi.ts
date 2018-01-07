import Ast, {QuoteType, NewLineKind} from "ts-simple-ast";
import * as path from "path";
import * as pathUtils from "./utils/pathUtils";
import {Maintainer} from "./Maintainer";
import {Options} from "./Options";
import {watch} from "./watch";
import {determineQuoteType} from "./utils";

export class PublicApi {
    private readonly rootDirPath: string;

    constructor(rootDirPath: string, private readonly options: Options = {}) {
        this.rootDirPath = pathUtils.standardizePath(rootDirPath);
    }

    async updateDirectory(dirPath: string) {
        const {rootDir, dir, maintainer} = this.setup(dirPath);
        maintainer.updateDir(dir);
        await rootDir.saveUnsavedSourceFiles();
    }

    watchDirectory(dirPath: string) {
        const {rootDir, dir, maintainer} = this.setup(dirPath);
        return watch(rootDir, dir, maintainer);
    }

    private setup(dirPath: string) {
        dirPath = this.verifyAndGetPath(dirPath);

        const ast = getAst(this.rootDirPath, this.options);
        const dir = ast.addExistingDirectory(dirPath);
        const rootDir = ast.getRootDirectories()[0];
        const maintainer = new Maintainer(rootDir, this.options);

        return {ast, dir, rootDir, maintainer};
    }

    private verifyAndGetPath(dirPath: string) {
        dirPath = pathUtils.standardizePath(dirPath);
        if (!pathUtils.isDescendantOf(this.rootDirPath, dirPath))
            throw new Error(`The root directory (${this.rootDirPath}) must be a sub directory of the specified directory (${dirPath}).`);
        return dirPath;
    }
}

export function getAst(dirPath: string, options: Options) {
    const ast = new Ast({ compilerOptions: { allowJs: true } });
    ast.addExistingSourceFiles(
        path.join(dirPath, "**/*.{js,ts,jsx,tsx}"),
        "!" + path.join(dirPath, "**/*.d.ts"));

    if (options.quoteType === "'")
        ast.manipulationSettings.set({ quoteType: QuoteType.Single });
    else if (options.quoteType === "\"")
        ast.manipulationSettings.set({ quoteType: QuoteType.Double });
    else
        ast.manipulationSettings.set({ quoteType: determineQuoteType(ast) });

    if (options.newLineType === "\r\n")
        ast.manipulationSettings.set({ newLineKind: NewLineKind.CarriageReturnLineFeed });

    return ast;
}
