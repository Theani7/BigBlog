export default {
  '*.{ts,tsx,js,jsx,astro}': ['eslint --fix', 'prettier --write'],
  '*.{md,mdx}': ['prettier --write'],
  '*.{json,json5,yml,yaml}': ['prettier --write'],
};
