import {expect} from "chai";
import Ast, {QuoteKind} from "ts-simple-ast";
import {determineQuoteKind} from "./../../utils";

describe("determineQuoteKind", () => {
    it("should determine as double quote when there are no files", () => {
        const ast = new Ast({ useVirtualFileSystem: true });
        expect(determineQuoteKind(ast)).to.equal(QuoteKind.Double);
    });

    it("should determine as single quote when there's a file with an import declaration with a single quote", () => {
        const ast = new Ast({ useVirtualFileSystem: true });
        ast.createSourceFile("file.ts", "");
        ast.createSourceFile("dir/file.ts", "import * from 'test';");
        expect(determineQuoteKind(ast)).to.equal(QuoteKind.Single);
    });

    it("should determine as double quote when there's a file with an import declaration with a double quote", () => {
        const ast = new Ast({ useVirtualFileSystem: true });
        ast.createSourceFile("file.ts", "");
        ast.createSourceFile("dir/file.ts", `import * from "test";`);
        expect(determineQuoteKind(ast)).to.equal(QuoteKind.Double);
    });
});
