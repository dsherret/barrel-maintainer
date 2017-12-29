import * as chokidar from "chokidar";
import * as path from "path";
import {FileSystemRefreshResult, Directory} from "ts-simple-ast";
import {Maintainer} from "./Maintainer";
import {Throttler, DirectoryAncestorCollection} from "./utils";

export function watch(rootDir: Directory, directory: Directory, maintainer: Maintainer) {
    const watchThrottler = new WatchThrottler(100, maintainer, rootDir);
    const watcher = chokidar.watch(path.join(directory.getPath(), "**/*.{ts,js,tsx,jsx}")).on("all", async (event: string, path: string) => {
        const sourceFile = directory.getSourceFile(path) || directory.addSourceFileIfExists(path);
        if (sourceFile == null)
            return;

        const dirToUpdate = sourceFile.getDirectory();
        const result = await sourceFile.refreshFromFileSystem();
        switch (result) {
            case FileSystemRefreshResult.Updated:
            case FileSystemRefreshResult.Deleted:
                watchThrottler.addDirectory(dirToUpdate);
                break;
        }
    });

    return {
        stop: () => {
            watcher.removeAllListeners();
        }
    };
}

class WatchThrottler {
    private readonly directories = new DirectoryAncestorCollection();
    private readonly throttler: Throttler;

    constructor(delay: number, private readonly maintainer: Maintainer, private readonly rootDir: Directory) {
        this.throttler = new Throttler(delay, () => {
            for (const directory of this.directories.getAll()) {
                this.maintainer.updateDir(directory);
                console.log(`Updated ${directory.getPath()}`);
            }
            this.directories.clear();
            this.rootDir.saveUnsavedSourceFiles();
        });
    }

    addDirectory(dir: Directory) {
        this.directories.tryAdd(dir);
        this.throttler.run();
    }
}
