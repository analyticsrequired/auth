import fs from "fs";
import babel from "rollup-plugin-babel";

const pkg = JSON.parse(fs.readFileSync("./package.json"));
const external = Object.keys(pkg.dependencies || {});

export default [
  {
    input: "src/index.js",
    output: {
      file: "dist/index.js",
      format: "cjs",
      sourcemap: "inline"
    },
    external,
    plugins: [
      babel({
        exclude: "node_modules/**"
      })
    ]
  }
];
