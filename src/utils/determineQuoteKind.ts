import * as ts from "typescript";
import Ast, { QuoteKind } from "ts-simple-ast";

/**
 * Finds a source file with an import declaration, then checks what quote kind it's using.
 * @param ast - Ast.
 */
export function determineQuoteKind(ast: Ast) {
    const defaultType = QuoteKind.Double;
    const sourceFileWithImport = ast.getSourceFiles().find(s => s.getImportDeclarations().length > 0);
    if (sourceFileWithImport == null)
        return defaultType;
    const importDeclaration = sourceFileWithImport.getImportDeclarations()[0];
    const stringLiteral = importDeclaration.getFirstChildByKind(ts.SyntaxKind.StringLiteral);

    return stringLiteral == null ? defaultType : stringLiteral.getQuoteKind();
}