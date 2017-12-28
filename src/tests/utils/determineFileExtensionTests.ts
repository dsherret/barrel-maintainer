import {expect} from "chai";
import Ast from "ts-simple-ast";
import {determineFileExtension} from "./../../utils";

describe("determineFileExtension", () => {
    function setup() {
        const ast = new Ast({ useVirtualFileSystem: true });
        const rootDir = ast.createDirectory("rootDir");
        return {ast, rootDir};
    }

    it("should determine as js when there are no files", () => {
        const {ast, rootDir} = setup();
        expect(determineFileExtension(rootDir)).to.equal("js");
    });

    it("should determine as js when there are more js files", () => {
        const {ast, rootDir} = setup();
        rootDir.createSourceFile("file.ts");
        rootDir.createSourceFile("dir/file.js");
        rootDir.createSourceFile("dir/file2.js");
        expect(determineFileExtension(rootDir)).to.equal("js");
    });

    it("should determine as ts when there are more ts files", () => {
        const {ast, rootDir} = setup();
        rootDir.createSourceFile("file.ts");
        rootDir.createSourceFile("dir/file.ts");
        rootDir.createSourceFile("dir/file2.js");
        expect(determineFileExtension(rootDir)).to.equal("ts");
    });
});
