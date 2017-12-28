import {expect} from "chai";
import * as path from "path";
import * as os from "os";
import {Options} from "./../Options";
import {parseCommandLineArgs} from "./../parseCommandLineArgs";

describe("parseCommandLineArgs", () => {
    function doThrowTest(args: string) {
        expect(() => parseCommandLineArgs(args.split(" "))).to.throw();
    }

    function doTest(args: string, expected: Options & { path?: string; }) {
        const result = parseCommandLineArgs(args.split(" "));
        if (expected.path == null)
            expect(result.path).to.equal(path.resolve());
        else
            expect(result.path).to.equal(path.normalize(path.resolve(expected.path)));
        expect(result.fileExtension).to.equal(expected.fileExtension);
        expect(result.newLineType).to
            .equal(expected.newLineType || (os.platform() === "win32" ? "\r\n" : "\n"));
        expect(result.quoteType).to.equal(expected.quoteType);
        expect(result.includeRootDir).to.equal(expected.includeRootDir || false);
    }

    it("should return the defaults when not specified", () => {
        doTest("", {});
    });

    it("should return the path when specified", () => {
        doTest("src", { path: "src" });
    });

    describe("fileExtension", () => {
        it("should use ts when specifying", () => {
            doTest("--ts", { fileExtension: "ts" });
        });

        it("should use js when specifying", () => {
            doTest("--js", { fileExtension: "js" });
        });

        it("should throw when specifying both", () => {
            doThrowTest("--ts --js");
        });
    });

    describe("newLineType", () => {
        it("should use crlf when specifying", () => {
            doTest("--crlf", { newLineType: "\r\n" });
        });

        it("should use lf when specifying", () => {
            doTest("--lf", { newLineType: "\n" });
        });

        it("should throw when specifying both", () => {
            doThrowTest("--crlf --lf");
        });
    });

    describe("quotes", () => {
        it("should use single quotes when specifying", () => {
            doTest("--singleQuotes", { quoteType: "'" });
        });

        it("should use double quotes when specifying", () => {
            doTest("--doubleQuotes", { quoteType: "\"" });
        });

        it("should throw when specifying both", () => {
            doThrowTest("--singleQuotes --doubleQuotes");
        });
    });

    describe("includeRootDir", () => {
        it("should include the root dir when specifying", () => {
            doTest("--includeRootDir", { includeRootDir: true });
        });
    });
});