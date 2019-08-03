import { Project, QuoteKind, SyntaxKind } from "ts-morph";

/**
 * Finds a source file with an import declaration, then checks what quote kind it's using.
 * @param ast - Ast.
 */
export function determineQuoteKind(project: Project) {
    const defaultType = QuoteKind.Double;
    const sourceFileWithImport = project.getSourceFiles().find(s => s.getImportDeclarations().length > 0);
    if (sourceFileWithImport == null)
        return defaultType;
    const importDeclaration = sourceFileWithImport.getImportDeclarations()[0];
    const stringLiteral = importDeclaration.getFirstChildByKind(SyntaxKind.StringLiteral);

    return stringLiteral == null ? defaultType : stringLiteral.getQuoteKind();
}
