import * as chokidar from "chokidar";
import * as path from "path";
import Ast, {FileSystemRefreshResult} from "ts-simple-ast";
import {BarrelMaintainer, BarrelMaintainerOptions} from "./BarrelMaintainer";

export function watch(ast: Ast, options: BarrelMaintainerOptions) {
    const rootDir = ast.getRootDirectories()[0];
    if (rootDir == null)
        throw new Error("Could not find a root directory.");

    const maintainer = new BarrelMaintainer(rootDir, options);

    console.log(`Watching files in '${rootDir.getPath()}'...`);
    const watcher = chokidar.watch(path.join(rootDir.getPath(), "**/*.{ts,js}")).on("all", async (event: string, path: string) => {
        const sourceFile = ast.getSourceFile(path) || ast.addSourceFileIfExists(path);
        if (sourceFile == null)
            return;

        const directory = sourceFile.getDirectory();
        const dirPath = directory.getPath();
        const result = await sourceFile.refreshFromFileSystem();
        switch (result) {
            case FileSystemRefreshResult.Updated:
            case FileSystemRefreshResult.Deleted:
                maintainer.updateDir(directory);
                ast.saveUnsavedSourceFiles();
                console.log(`Updated ${dirPath}`);
                break;
        }
    });

    return {
        stop: () => {
            watcher.removeAllListeners();
        }
    };
}