import globals from "globals";
import pluginJs from "@eslint/js";


export default [
  {files: ["**/*.js"], languageOptions: {sourceType: "commonjs"}},
  {languageOptions: { globals: globals.node,  }},
  pluginJs.configs.recommended,
  {rules: {
    'max-len': ['error', { code: 90 }]
  }}
];
