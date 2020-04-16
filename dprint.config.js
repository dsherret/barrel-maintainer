// @ts-check
const { TypeScriptPlugin } = require("dprint-plugin-typescript");
const { JsoncPlugin } = require("dprint-plugin-jsonc");

/** @type { import("dprint").Configuration } */
module.exports.config = {
    projectType: "openSource",
    lineWidth: 180,
    plugins: [
        new TypeScriptPlugin({
            useBraces: "preferNone",
            singleBodyPosition: "nextLine",
            nextControlFlowPosition: "nextLine",
            "arrowFunction.useParentheses": "preferNone",
            "tryStatement.nextControlFlowPosition": "sameLine",
            "quoteStyle": "alwaysDouble",
            "semiColons": "always",
        }),
        new JsoncPlugin({
            indentWidth: 2,
        }),
    ],
    includes: [
        "**/*{.ts,.tsx,.json,.js}",
    ],
};
