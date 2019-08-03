import { expect } from "chai";
import { Project } from "ts-morph";
import { determineFileExtension } from "./../../utils";

describe("determineFileExtension", () => {
    function setup() {
        const project = new Project({ useVirtualFileSystem: true });
        const rootDir = project.createDirectory("rootDir");
        return { project, rootDir };
    }

    it("should determine as js when there are no files", () => {
        const { rootDir } = setup();
        expect(determineFileExtension(rootDir)).to.equal("js");
    });

    it("should determine as js when there are more js files", () => {
        const { rootDir } = setup();
        rootDir.createSourceFile("file.ts");
        rootDir.createSourceFile("dir/file.js");
        rootDir.createSourceFile("dir/file2.js");
        expect(determineFileExtension(rootDir)).to.equal("js");
    });

    it("should determine as ts when there are more ts files", () => {
        const { rootDir } = setup();
        rootDir.createSourceFile("file.ts");
        rootDir.createSourceFile("dir/file.ts");
        rootDir.createSourceFile("dir/file2.js");
        expect(determineFileExtension(rootDir)).to.equal("ts");
    });
});
