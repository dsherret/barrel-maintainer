import * as chokidar from "chokidar";
import * as path from "path";
import { FileSystemRefreshResult, Directory } from "ts-morph";
import { Maintainer } from "./Maintainer";
import { Throttler, DirectoryAncestorCollection } from "./utils";

export function watch(rootDir: Directory, directory: Directory, maintainer: Maintainer) {
    const watchThrottler = new WatchThrottler(100, maintainer, rootDir);
    const watcher = chokidar.watch([path.join(directory.getPath(), "**/*.{ts,js,tsx,jsx}"), "!" + path.join(directory.getPath(), "**/*.d.ts")], {
        ignorePermissionErrors: true,
        usePolling: true,
        interval: 300
    }).on("all", async (event: string, path: string) => {
        try {
            let sourceFile = directory.getSourceFile(path);
            if (sourceFile == null) {
                sourceFile = directory.addSourceFileAtPathIfExists(path);
                if (sourceFile != null)
                    watchThrottler.addDirectory(sourceFile.getDirectory());
                return;
            }

            const dirToUpdate = sourceFile.getDirectory();
            const result = await sourceFile.refreshFromFileSystem();
            switch (result) {
                case FileSystemRefreshResult.Updated:
                case FileSystemRefreshResult.Deleted:
                    watchThrottler.addDirectory(dirToUpdate);
                    break;
            }
        } catch (err) {
            console.error(err);
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
            this.rootDir.save();
        });
    }

    addDirectory(dir: Directory) {
        this.directories.tryAdd(dir);
        this.throttler.run();
    }
}
