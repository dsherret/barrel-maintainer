import * as pathUtils from "./pathUtils";
import {getAst} from "./getAst";
import {BarrelMaintainer} from "./BarrelMaintainer";
import {Options} from "./Options";
import {updateDirectory as updateDirInternal} from "./updateDirectory";

export async function updateDirectory(dirPath: string, options: Options, rootDirPath?: string) {
    rootDirPath = rootDirPath || dirPath;
    dirPath = pathUtils.standardizePath(dirPath);
    rootDirPath = pathUtils.standardizePath(rootDirPath);
    if (!pathUtils.isDescendantOf(rootDirPath, dirPath))
        throw new Error(`The root directory (${rootDirPath}) must be a sub directory of the specified directory (${dirPath}).`);

    const ast = getAst(rootDirPath);
    const dir = ast.addExistingDirectory(dirPath);
    await updateDirInternal(ast, options, dir);
}
