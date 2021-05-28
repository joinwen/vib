export default [
  {
    input: "src/index.js",
    output: {
      name: "vib",
      file: "dist/vib.cjs.js",
      format: "cjs",
      sourcemap: "inline"
    }
  },
  {
    input: "src/index.js",
    output: {
      name: "vib",
      file: "dist/vib.esm.js",
      format: "esm"
    }
  },
  {
    input: "src/index.js",
    output: {
      name: "vib",
      file: "dist/vib.umd.js",
      format: "umd"
    }
  }
];
