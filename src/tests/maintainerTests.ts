import { expect } from "chai";
import { Project, Directory, QuoteKind } from "ts-morph";
import { Maintainer } from "./../Maintainer";

describe("Maintainer", () => {
    function setup(opts: { fileExtension?: "ts" | "js"; quoteStyle?: "\"" | "'"; includeRootDir?: boolean; } = {}) {
        const {fileExtension = "ts", quoteStyle, includeRootDir} = opts;
        const project = new Project({ useVirtualFileSystem: true });
        if (quoteStyle === "'")
            project.manipulationSettings.set({ quoteKind: QuoteKind.Single });
        const rootDir = project.createDirectory("rootDir");
        const maintainer = new Maintainer(rootDir, { fileExtension, includeRootDir });
        return {project, rootDir, maintainer};
    }

    function checkBarrels(dir: Directory, expectedBarrelFiles: { path: string; text: string; }[]) {
        const barrelFiles = dir.getDescendantSourceFiles().filter(s => s.getBaseName() === "index.ts" || s.getBaseName() === "index.js");
        for (const file of barrelFiles) {
            const index = expectedBarrelFiles.findIndex(f => "/rootDir/" + f.path === file.getFilePath());
            if (index === -1)
                throw new Error(`Could not find expected file of ${file.getFilePath()}`);
            const expectedFile = expectedBarrelFiles.splice(index, 1)[0];
            expect(file.getFullText()).to.equal(expectedFile.text, `Expected file at ${file.getFilePath()} to match.`);
        }

        if (expectedBarrelFiles.length > 0)
            throw new Error("Left over files: " + expectedBarrelFiles.map(f => f.path));
    }

    describe("#updateDir()", () => {
        it("should determine the file extension", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const rootDir = project.createDirectory("dir");
            rootDir.createSourceFile("dir/file.ts", "");
            const maintainer = new Maintainer(rootDir, {});
            maintainer.updateDir(rootDir);

            it("should have the correct files", () => {
                checkBarrels(rootDir, [
                    { path: "dir/index.ts", text: `export * from "./file";\n` },
                ]);
            });
        });

        it("should throw if specifying a directory that is not a descendant or equal to the root directory", () => {
            const { project, maintainer } = setup();
            const otherDir = project.createDirectory("otherDir");
            expect(() => maintainer.updateDir(otherDir)).to.throw();
        });

        it("should update the root directory when specifying so", () => {
            const { project, rootDir } = setup({ includeRootDir: true });
            const dir = project.createDirectory("dir");
            dir.createSourceFile("dir/file.ts", "");

            it("should have the correct files", () => {
                checkBarrels(rootDir, [
                    { path: "index.ts", text: `export * from "./dir";\n` },
                    { path: "dir/index.ts", text: `export * from "./file";\n` },
                ]);
            });
        });

        describe("specifying the root directory", () => {
            const { rootDir, maintainer } = setup();

            // entities dir
            const entitiesDir = rootDir.createDirectory("entities");
            entitiesDir.createSourceFile("person.ts", "export class Person {}");
            entitiesDir.createSourceFile("note.ts", "/* barrel:ignore */\nexport class Note {}");

            // random dir
            const randomDir = rootDir.createDirectory("random");
            randomDir.createSourceFile("file1.ts", "export = 5;");
            randomDir.createSourceFile("file2.ts", "export default 5;");
            randomDir.createSourceFile("file3.ts", "console.log(5);");
            const randomSubDir = randomDir.createDirectory("subDir");
            randomSubDir.createSourceFile("jsFile.js", "export class MyClass {}");
            const randomEmptyDir = randomDir.createDirectory("emptyDir");

            maintainer.updateDir(rootDir);

            it("should have the correct files", () => {
                checkBarrels(rootDir, [
                    { path: "entities/index.ts", text: `export * from "./person";\n` },
                    {
                        path: "random/index.ts",
                        text: `export * from "./file1";\n` +
                            `export * from "./file2";\n` +
                            `export * from "./subDir";\n`
                    },
                    { path: "random/subDir/index.ts", text: `export * from "./jsFile";\n` }
                ]);
            });
        });

        describe("only updating one directory", () => {
            const { rootDir, maintainer } = setup();

            const entitiesDir = rootDir.createDirectory("entities");
            entitiesDir.createSourceFile("person.ts", "export class Person {}");
            const randomDir = rootDir.createDirectory("random");
            randomDir.createSourceFile("file1.ts", "export = 5;");
            const randomSubDir = randomDir.createDirectory("subDir");
            randomSubDir.createSourceFile("jsFile.js", "export class MyClass {}");
            maintainer.updateDir(rootDir.getDirectoryOrThrow("random/subDir"));

            it("should have the correct files", () => {
                checkBarrels(rootDir, [
                    { path: "random/index.ts", text: `export * from "./subDir";\n` },
                    { path: "random/subDir/index.ts", text: `export * from "./jsFile";\n` }
                ]);
            });
        });

        describe("deleting all the files in a folder after updating", () => {
            const { project, rootDir, maintainer } = setup();
            const randomDir = rootDir.createDirectory("random");
            randomDir.createSourceFile("file1.ts", "export = 5;");
            const randomSubDir = randomDir.createDirectory("subDir");
            randomSubDir.createSourceFile("jsFile.js", "export class MyClass {}");
            const randomEmptyDir = randomDir.createDirectory("emptyDir");
            maintainer.updateDir(rootDir);

            const subDir = rootDir.getDirectoryOrThrow("random/subDir");
            subDir.getSourceFileOrThrow("jsFile.js").deleteImmediatelySync();
            const indexPath = subDir.getSourceFileOrThrow("index.ts").getFilePath();
            maintainer.updateDir(subDir);

            it("should have deleted the index file in the sub directory", () => {
                expect(project.getFileSystem().fileExistsSync(indexPath)).to.be.false;
                expect(subDir.getSourceFile("index.ts")).to.be.undefined;
            });

            it("should have the correct files", () => {
                checkBarrels(rootDir, [
                    { path: "random/index.ts", text: `export * from "./file1";\n` }
                ]);
            });
        });

        describe("deleting a file way down in a sub folder", () => {
            const { maintainer, rootDir } = setup();
            const descendantFile = rootDir.createSourceFile("dir/subdir/deeper/more/file.ts", "export class MyClass {}");
            const finalDirectory = descendantFile.getDirectory();

            maintainer.updateDir(rootDir);
            rootDir.getSourceFileOrThrow("dir/subdir/index.ts").addClass({ name: "MyClass", isExported: true });
            rootDir.getSourceFileOrThrow("dir/subdir/deeper/index.ts").addClass({ name: "MyClass" });
            descendantFile.delete();
            maintainer.updateDir(finalDirectory);

            it("should have the correct files", () => {
                checkBarrels(rootDir, [
                    { path: "dir/index.ts", text: `export * from "./subdir";\n` },
                    { path: "dir/subdir/index.ts", text: `export class MyClass {\n}\n` },
                    { path: "dir/subdir/deeper/index.ts", text: `class MyClass {\n}\n` },
                ]);
            });
        });

        describe("deleting a file way down in a sub folder", () => {
            const { maintainer, rootDir } = setup();
            const descendantFile = rootDir.createSourceFile("dir/subdir/deeper/more/file.ts", "export class MyClass {}");
            const finalDirectory = descendantFile.getDirectory();

            maintainer.updateDir(rootDir);
            descendantFile.delete();
            maintainer.updateDir(finalDirectory);

            it("should have no barrel files", () => {
                checkBarrels(rootDir, []);
            });
        });

        describe("refreshing a folder multiple times", () => {
            const { maintainer, rootDir } = setup();
            const file = rootDir.createSourceFile("dir/file.ts", "export class MyClass {}");
            const dir = file.getDirectory();

            maintainer.updateDir(rootDir);
            maintainer.updateDir(rootDir);

            it("should have the correct files", () => {
                checkBarrels(rootDir, [{
                    path: "dir/index.ts",
                    text: `export * from "./file";\n`
                }]);
            });
        });

        describe("adding a file", () => {
            const { maintainer, rootDir } = setup();
            const file = rootDir.createSourceFile("dir/b.ts", "export class MyClass {}");
            const subdir = file.getDirectory();

            maintainer.updateDir(rootDir);
            rootDir.createSourceFile("dir/c.ts", "export class MyClass2 {}");
            rootDir.createSourceFile("dir/a.ts", "export class MyClass2 {}");
            rootDir.createSourceFile("dir/f.ts", "export class MyClass2 {}");
            rootDir.createSourceFile("dir/E.ts", "export class MyClass2 {}");
            rootDir.createSourceFile("dir/d.ts", "export class MyClass2 {}");
            maintainer.updateDir(subdir);

            it("should have the correct files and put them in alphabetical order", () => {
                checkBarrels(rootDir, [{
                    path: "dir/index.ts",
                    text: `export * from "./a";\n` +
                        `export * from "./b";\n` +
                        `export * from "./c";\n` +
                        `export * from "./d";\n` +
                        `export * from "./E";\n` +
                        `export * from "./f";\n`
                }]);
            });
        });

        describe("adding a folder", () => {
            const { maintainer, rootDir } = setup();
            const file = rootDir.createSourceFile("dir/subdir/file.ts", "export class MyClass {}");
            const subdir = file.getDirectory();

            maintainer.updateDir(rootDir);
            const newFile = rootDir.createSourceFile("dir/subdir/deeper/file.ts", "export class MyClass {}");
            maintainer.updateDir(subdir);

            it("should have the correct files", () => {
                checkBarrels(rootDir, [{
                    path: "dir/index.ts",
                    text: `export * from "./subdir";\n`
                }, {
                    path: "dir/subdir/index.ts",
                    text: `export * from "./deeper";\nexport * from "./file";\n`
                }, {
                    path: "dir/subdir/deeper/index.ts",
                    text: `export * from "./file";\n`
                }]);
            });
        });

        describe("having a named export in a barrel", () => {
            const { maintainer, rootDir } = setup();
            rootDir.createSourceFile("dir/file1.ts", "export class MyClass {}");
            rootDir.createSourceFile("dir/file2.ts", "export class MyClass2 {}");
            rootDir.createSourceFile("dir/index.ts", `export {MyClass2} from "./file2";\n`);
            maintainer.updateDir(rootDir);

            it("should keep the named export as-is", () => {
                checkBarrels(rootDir, [{
                    path: "dir/index.ts",
                    text: `export * from "./file1";\n` +
                        `export {MyClass2} from "./file2";\n`
                }]);
            });
        });

        describe("using single quotes and js files", () => {
            const { maintainer, rootDir } = setup({ quoteStyle: "'", fileExtension: "js" });
            rootDir.createSourceFile("dir/file.js", "export class MyClass {}");
            maintainer.updateDir(rootDir);

            it("should have the correct files", () => {
                checkBarrels(rootDir, [{
                    path: "dir/index.js",
                    text: `export * from './file';\n`
                }]);
            });
        });
    });
});