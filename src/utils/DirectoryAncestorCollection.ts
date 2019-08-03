import { Directory } from "ts-morph";

/**
 * Holds a collection of directories, but only maintains the parent-most directories.
 *
 * 1. If a directory is added and an ancestor exists in the collection, the directory will not be added.
 * 2. If a directory is added and a descendant exists in the collection, the directory will be added
 *    and the descendant will be removed.
 * 3. If a directory is added and neither an ancestor or descendant exists in the collection,
 *    the directory will be added.
 */
export class DirectoryAncestorCollection {
    private readonly directories: Directory[] = [];

    tryAdd(dir: Directory) {
        for (let i = this.directories.length - 1; i >= 0; i--) {
            const existingDir = this.directories[i];
            if (dir.isDescendantOf(existingDir) || dir === existingDir)
                return;
            if (dir.isAncestorOf(existingDir))
                this.directories.splice(i, 1);
        }

        this.directories.push(dir);
    }

    getAll() {
        return [...this.directories];
    }

    clear() {
        this.directories.length = 0;
    }
}
