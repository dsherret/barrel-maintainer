import * as ts from "typescript";
import Ast, {SourceFile, Directory, TypeGuards} from "ts-simple-ast";
import {determineFileExtension} from "./utils";

export interface BarrelMaintainerOptions {
    includeRootDir?: boolean;
    fileExtension?: "ts" | "js";
}

export class BarrelMaintainer {
    private readonly barrelFileName: string;
    private readonly includeRootDir: boolean;

    constructor(private readonly rootDir: Directory, options: BarrelMaintainerOptions) {
        this.includeRootDir = options.includeRootDir || false;
        this.barrelFileName = `index.${options.fileExtension || determineFileExtension(rootDir)}`;
    }

    updateDir(dir: Directory) {
        if (dir !== this.rootDir && !dir.isDescendantOf(this.rootDir))
            throw new Error(`Provided directory of ${dir.getPath()} is not equal to or a descendant of the root directory (${this.rootDir.getPath()}).`);

        if (!this.includeRootDir && dir === this.rootDir) {
            for (const subDir of dir.getDirectories())
                this.updateDirInternal(subDir);
            return;
        }

        const isBarrelDir = this.updateDirInternal(dir);
        if (isBarrelDir)
            this.addBarrelExportToParent(dir);
        else
            this.removeBarrelExportFromParent(dir);
    }

    private updateDirInternal(dir: Directory): boolean {
        let barrelFile = dir.getSourceFile(this.barrelFileName);
        const dirsForBarrel = dir.getDirectories().filter(d => this.updateDirInternal(d));
        const filesForBarrel = dir.getSourceFiles().filter(s => s !== barrelFile && isSourceFileForBarrel(s));

        if (barrelFile != null)
            removeNamespaceExports(barrelFile);

        if (filesForBarrel.length > 0 || dirsForBarrel.length > 0) {
            if (barrelFile == null)
                barrelFile = dir.createSourceFile(this.barrelFileName);

            addNamespaceExports(barrelFile, [
                ...filesForBarrel.map(getModuleSpecifierForFile),
                ...dirsForBarrel.map(getModuleSpecifierForDir)
            ]);
        }
        else if (barrelFile != null && barrelFile.getStatements().length === 0) {
            barrelFile.delete();
            barrelFile = undefined;
        }

        return barrelFile != null && isSourceFileForBarrel(barrelFile);
    }

    private addBarrelExportToParent(dir: Directory) {
        const parentDir = this.getParentDir(dir);
        if (parentDir == null)
            return;
        const parentBarrelFile = parentDir.getSourceFile(this.barrelFileName) || parentDir.createSourceFile(this.barrelFileName);
        const parentExport = getExportForDir(parentBarrelFile, dir);
        if (parentExport != null)
            return;

        addNamespaceExports(parentBarrelFile, [getModuleSpecifierForDir(dir)]);
        this.addBarrelExportToParent(parentDir);
    }

    private removeBarrelExportFromParent(dir: Directory) {
        const parentDir = this.getParentDir(dir);
        if (parentDir == null)
            return;
        const parentBarrelFile = parentDir.getSourceFile(this.barrelFileName);
        if (parentBarrelFile == null)
            return;
        const parentExport = getExportForDir(parentBarrelFile, dir);
        if (parentExport == null)
            return;

        parentExport.remove();
        if (!isSourceFileForBarrel(parentBarrelFile))
            this.removeBarrelExportFromParent(parentBarrelFile.getDirectory());

        if (parentBarrelFile.getStatements().length === 0)
            parentBarrelFile.delete();
    }

    private getParentDir(dir: Directory) {
        const parent = dir.getParent();
        if (parent == null || dir === this.rootDir || !this.includeRootDir && parent === this.rootDir)
            return undefined;
        return parent;
    }
}

const ignoreFileRegex = /\/\*\s*barrel:ignore\s*\*\//i;

function isSourceFileForBarrel(sourceFile: SourceFile) {
    // ignore files containing /* barrel:ignore */
    if (ignoreFileRegex.test(sourceFile.getFullText()))
        return false;

    return hasExports();

    function hasExports() {
        for (const statement of sourceFile.getStatements()) {
            if (TypeGuards.isExportDeclaration(statement) || TypeGuards.isExportAssignment(statement))
                return true;
            if (TypeGuards.isExportableNode(statement) && statement.isExported())
                return true;
        }

        return false;
    }
}

function addNamespaceExports(sourceFile: SourceFile, moduleSpecifiers: string[]) {
    sourceFile.addExportDeclarations(moduleSpecifiers.map(moduleSpecifier => ({ moduleSpecifier })));
}

function removeNamespaceExports(sourceFile: SourceFile) {
    sourceFile.getExportDeclarations().filter(e => e.isNamespaceExport()).forEach(e => e.remove());
}

function getExportForDir(barrelFile: SourceFile, dir: Directory) {
    return barrelFile.getExportDeclaration(e => e.isNamespaceExport() && e.getModuleSpecifier() === getModuleSpecifierForDir(dir));
}

function getModuleSpecifierForDir(dir: Directory) {
    return `./${dir.getBaseName()}`;
}

function getModuleSpecifierForFile(file: SourceFile) {
    return `./${file.getBaseName().replace(/\.(ts|js)$/, "")}`;
}