/** @type {import("prettier").Config} */
const config = {
  semi: false,
  trailingComma: "all",
  singleQuote: true,
  tabWidth: 2,
  printWidth: 80,
  jsxSingleQuote: false,
  bracketSpacing: true,
  plugins: ["prettier-plugin-astro", "prettier-plugin-tailwindcss"],
  pluginSearchDirs: false,
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
    {
      files: "*.svelte",
      options: {
        parser: "svelte",
      },
    },
  ],
};

export default config;
