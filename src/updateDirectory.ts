import Ast, {Directory} from "ts-simple-ast";
import {BarrelMaintainer, BarrelMaintainerOptions} from "./BarrelMaintainer";

export async function updateDirectory(ast: Ast, options: BarrelMaintainerOptions, dir?: Directory) {
    const rootDir = ast.getRootDirectories()[0];
    if (rootDir == null)
        throw new Error("Could not find the root directory.");

    const maintainer = new BarrelMaintainer(rootDir, options);
    maintainer.updateDir(dir || rootDir);
    await ast.saveUnsavedSourceFiles();
}