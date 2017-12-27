import Ast from "ts-simple-ast";
import * as path from "path";

export function getAst(dirPath: string) {
    const ast = new Ast({ compilerOptions: { allowJs: true } });
    ast.addExistingSourceFiles(path.join(dirPath, "**/*.{js,ts}"));
    return ast;
}