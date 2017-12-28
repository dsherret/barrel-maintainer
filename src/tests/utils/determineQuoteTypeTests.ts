import {expect} from "chai";
import Ast, {QuoteType} from "ts-simple-ast";
import {determineQuoteType} from "./../../utils";

describe("determineQuoteType", () => {
    it("should determine as double quote when there are no files", () => {
        const ast = new Ast({ useVirtualFileSystem: true });
        expect(determineQuoteType(ast)).to.equal(QuoteType.Double);
    });

    it("should determine as single quote when there's a file with an import declaration with a single quote", () => {
        const ast = new Ast({ useVirtualFileSystem: true });
        ast.createSourceFile("file.ts", "");
        ast.createSourceFile("dir/file.ts", "import * from 'test';");
        expect(determineQuoteType(ast)).to.equal(QuoteType.Single);
    });

    it("should determine as double quote when there's a file with an import declaration with a double quote", () => {
        const ast = new Ast({ useVirtualFileSystem: true });
        ast.createSourceFile("file.ts", "");
        ast.createSourceFile("dir/file.ts", `import * from "test";`);
        expect(determineQuoteType(ast)).to.equal(QuoteType.Double);
    });
});
