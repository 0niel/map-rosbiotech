/** @type {import("prettier").Config} */
const config = {
  singleQuote: false,
  semi: false,
  plugins: [require.resolve("prettier-plugin-tailwindcss")],
}

module.exports = config
