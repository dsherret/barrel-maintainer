import { Directory } from "ts-simple-ast";

export function determineFileExtension(dir: Directory) {
    const extensions = dir.getDescendantSourceFiles().map(s => {
        const filePath = s.getFilePath();
        return filePath.substring(filePath.length - 2).toUpperCase();
    });
    const tsEndings = extensions.filter(p => p === "TS").length;
    const jsEndings = extensions.filter(p => p === "JS").length;

    return tsEndings > jsEndings ? "ts" : "js";
}