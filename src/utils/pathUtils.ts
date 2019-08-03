import * as nodePath from "path";

export function standardizePath(path: string) {
    return nodePath.normalize(nodePath.resolve(path));
}

export function isDescendantOf(path: string, expectedDescendant: string) {
    return expectedDescendant.startsWith(path);
}
