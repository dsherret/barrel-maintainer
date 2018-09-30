import { expect } from "chai";
import * as path from "path";
import * as os from "os";
import { CommandLineOptions } from "./../CommandLineOptions";
import { parseCommandLineArgs } from "./../parseCommandLineArgs";

describe("parseCommandLineArgs", () => {
    function doThrowTest(args: string) {
        expect(() => parseCommandLineArgs(args.split(" "))).to.throw();
    }

    function doTest(args: string, expected: Partial<CommandLineOptions>) {
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
        expect(result.showHelp).to.equal(expected.showHelp || false);
        expect(result.showVersion).to.equal(expected.showVersion || false);
    }

    it("should return the defaults when not specified", () => {
        doTest("", {});
    });

    it("should return the path when specified", () => {
        doTest("src", { path: "src" });
    });

    it("should return the path when including flags after", () => {
        doTest("src --ts", { path: "src", fileExtension: "ts" });
    });

    it("should return the path when including flags before", () => {
        doTest("--ts src", { path: "src", fileExtension: "ts" });
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

    describe("showVersion", () => {
        it("should show the version when specified short form", () => {
            doTest("-v", { showVersion: true });
        });

        it("should show the version when specified long form", () => {
            doTest("--version", { showVersion: true });
        });
    });

    describe("showHelp", () => {
        it("should show the help when specified short form", () => {
            doTest("-h", { showHelp: true });
        });

        it("should show the version when specified long form", () => {
            doTest("--help", { showHelp: true });
        });
    });
});