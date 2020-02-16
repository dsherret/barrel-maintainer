import { expect } from "chai";
import { Project, QuoteKind } from "ts-morph";
import { determineQuoteKind } from "./../../utils";

describe("determineQuoteKind", () => {
    it("should determine as double quote when there are no files", () => {
        const project = new Project({ useInMemoryFileSystem: true });
        expect(determineQuoteKind(project)).to.equal(QuoteKind.Double);
    });

    it("should determine as single quote when there's a file with an import declaration with a single quote", () => {
        const project = new Project({ useInMemoryFileSystem: true });
        project.createSourceFile("file.ts", "");
        project.createSourceFile("dir/file.ts", "import * from 'test';");
        expect(determineQuoteKind(project)).to.equal(QuoteKind.Single);
    });

    it("should determine as double quote when there's a file with an import declaration with a double quote", () => {
        const project = new Project({ useInMemoryFileSystem: true });
        project.createSourceFile("file.ts", "");
        project.createSourceFile("dir/file.ts", `import * from "test";`);
        expect(determineQuoteKind(project)).to.equal(QuoteKind.Double);
    });
});
