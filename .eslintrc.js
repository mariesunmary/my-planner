module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    "react-app",
    "react-app/jest",
    "plugin:jsdoc/recommended"
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: "module"
  },
  plugins: [
    "react",
    "react-hooks"
  ],
  rules: {
    "semi": ["warn", "always"],
    "eqeqeq": ["error", "always"],
    "no-unused-vars": "warn",
    "no-console": "warn",
    "prefer-const": "warn",
    "no-var": "error",
    "curly": ["warn", "all"],
    "react/prop-types": "warn"
  }
};
