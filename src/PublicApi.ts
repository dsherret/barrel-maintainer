import { Project, QuoteKind, NewLineKind } from "ts-morph";
import * as path from "path";
import * as pathUtils from "./utils/pathUtils";
import { Maintainer } from "./Maintainer";
import { Options } from "./Options";
import { watch } from "./watch";
import { determineQuoteKind } from "./utils";

export class PublicApi {
    private readonly rootDirPath: string;

    constructor(rootDirPath: string, private readonly options: Options = {}) {
        this.rootDirPath = pathUtils.standardizePath(rootDirPath);
    }

    async updateDirectory(dirPath: string) {
        const { rootDir, dir, maintainer } = this.setup(dirPath);
        maintainer.updateDir(dir);
        await rootDir.save();
    }

    watchDirectory(dirPath: string) {
        const { rootDir, dir, maintainer } = this.setup(dirPath);
        return watch(rootDir, dir, maintainer);
    }

    private setup(dirPath: string) {
        dirPath = this.verifyAndGetPath(dirPath);

        const project = getProject(this.rootDirPath, this.options);
        const dir = project.addExistingDirectory(dirPath);
        const rootDir = project.getRootDirectories()[0];
        const maintainer = new Maintainer(rootDir, this.options);

        return { project, dir, rootDir, maintainer };
    }

    private verifyAndGetPath(dirPath: string) {
        dirPath = pathUtils.standardizePath(dirPath);
        if (!pathUtils.isDescendantOf(this.rootDirPath, dirPath))
            throw new Error(`The root directory (${this.rootDirPath}) must be a sub directory of the specified directory (${dirPath}).`);
        return dirPath;
    }
}

export function getProject(dirPath: string, options: Options) {
    const project = new Project({ compilerOptions: { allowJs: true } });
    project.addExistingSourceFiles([
        path.join(dirPath, "**/*.{js,ts,jsx,tsx}"),
        "!" + path.join(dirPath, "**/*.d.ts")]);

    if (options.quoteType === "'")
        project.manipulationSettings.set({ quoteKind: QuoteKind.Single });
    else if (options.quoteType === "\"")
        project.manipulationSettings.set({ quoteKind: QuoteKind.Double });
    else
        project.manipulationSettings.set({ quoteKind: determineQuoteKind(project) });

    if (options.newLineType === "\r\n")
        project.manipulationSettings.set({ newLineKind: NewLineKind.CarriageReturnLineFeed });

    return project;
}
