import * as chokidar from "chokidar";
import * as path from "path";
import {FileSystemRefreshResult, Directory} from "ts-simple-ast";
import {BarrelMaintainer} from "./BarrelMaintainer";

export function watch(rootDir: Directory, directory: Directory, maintainer: BarrelMaintainer) {
    const watcher = chokidar.watch(path.join(directory.getPath(), "**/*.{ts,js,tsx,jsx}")).on("all", async (event: string, path: string) => {
        const sourceFile = directory.getSourceFile(path) || directory.addSourceFileIfExists(path);
        if (sourceFile == null)
            return;

        const dirToUpdate = sourceFile.getDirectory();
        const dirToUpdatePath = dirToUpdate.getPath();
        const result = await sourceFile.refreshFromFileSystem();
        switch (result) {
            case FileSystemRefreshResult.Updated:
            case FileSystemRefreshResult.Deleted:
                maintainer.updateDir(dirToUpdate);
                rootDir.saveUnsavedSourceFiles();
                console.log(`Updated ${dirToUpdatePath}`);
                break;
        }
    });

    return {
        stop: () => {
            watcher.removeAllListeners();
        }
    };
}