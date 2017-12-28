import * as ts from "typescript";
import Ast, {QuoteType} from "ts-simple-ast";

/**
 * Finds a source file with an import declaration, then checks what quote type it's using.
 * @param ast - Ast.
 */
export function determineQuoteType(ast: Ast) {
    const defaultType = QuoteType.Double;
    const sourceFileWithImport = ast.getSourceFiles().find(s => s.getImportDeclarations().length > 0);
    if (sourceFileWithImport == null)
        return defaultType;
    const importDeclaration = sourceFileWithImport.getImportDeclarations()[0];
    const stringLiteral = importDeclaration.getFirstChildByKind(ts.SyntaxKind.StringLiteral);

    return stringLiteral == null ? defaultType : stringLiteral.getQuoteType();
}