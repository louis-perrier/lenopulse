import next from "eslint-config-next";

// eslint-config-next v16 exporte une config plate (tableau).
const nextConfigs = Array.isArray(next) ? next : next.default;

const config = [
  { ignores: [".next/**", "out/**", "node_modules/**"] },
  ...nextConfigs,
];

export default config;
