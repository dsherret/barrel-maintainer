import * as ts from "typescript";
import Ast, {SourceFile, Directory, TypeGuards} from "ts-simple-ast";
import {determineFileExtension} from "./utils";

export interface MaintainerOptions {
    includeRootDir?: boolean;
    fileExtension?: "ts" | "js";
}

export class Maintainer {
    private readonly barrelFileName: string;
    private readonly includeRootDir: boolean;

    constructor(private readonly rootDir: Directory, options: MaintainerOptions) {
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
        const allExports = [...filesForBarrel.map(getModuleSpecifierForFile), ...dirsForBarrel.map(getModuleSpecifierForDir)];
        const existingExports = barrelFile == null ? [] : getNamespaceExports(barrelFile);
        const exportsToAdd = allExports.filter(e => existingExports.findIndex(i => i.getModuleSpecifier() === e) === -1);
        const exportsToRemove = existingExports.filter(e => allExports.indexOf(e.getModuleSpecifier()!) === -1);

        if (barrelFile == null && allExports.length > 0)
            barrelFile = dir.createSourceFile(this.barrelFileName);

        if (barrelFile == null)
            return false;

        if (exportsToAdd != null && exportsToAdd.length > 0)
            addNamespaceExports(barrelFile, exportsToAdd);

        for (const exportToRemove of exportsToRemove)
            exportToRemove.remove();

        if (barrelFile.getStatements().length === 0) {
            barrelFile.delete();
            return false;
        }

        return isSourceFileForBarrel(barrelFile);
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

function addNamespaceExports(barrelFile: SourceFile, moduleSpecifiers: string[]) {
    for (const moduleSpecifier of moduleSpecifiers) {
        barrelFile.insertExportDeclaration(getInsertIndex(moduleSpecifier), { moduleSpecifier });
    }

    function getInsertIndex(moduleSpecifier: string) {
        const insertDec = barrelFile.getExportDeclaration(s => s.getModuleSpecifier()! > moduleSpecifier);
        if (insertDec != null)
            return insertDec.getChildIndex();

        const exports = barrelFile.getExportDeclarations();
        if (exports.length > 0)
            return exports[exports.length - 1].getChildIndex() + 1;

        return barrelFile.getStatements().length;
    }
}

function getExportForDir(barrelFile: SourceFile, dir: Directory) {
    const dirModuleSpecifier = getModuleSpecifierForDir(dir);
    return barrelFile.getExportDeclaration(e => e.isNamespaceExport() && e.getModuleSpecifier() === dirModuleSpecifier);
}

function getNamespaceExports(barrelFile: SourceFile) {
    return barrelFile.getExportDeclarations().filter(e => e.isNamespaceExport() && e.hasModuleSpecifier());
}

function getModuleSpecifierForDir(dir: Directory) {
    return `./${dir.getBaseName()}`;
}

function getModuleSpecifierForFile(file: SourceFile) {
    return `./${file.getBaseName().replace(/\.(ts|js|tsx|jsx)$/, "")}`;
}