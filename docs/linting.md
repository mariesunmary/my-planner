# Linting Setup for FocusFlow

## Overview
For this React application, we have chosen **ESLint** as our primary static analysis tool. 

### Why ESLint?
ESLint is the industry standard for analyzing JavaScript and React codebases. It is highly configurable, supports modern ECMAScript standards (ES6+), and natively understands JSX (React's syntax). By integrating the `eslint-plugin-react` and `eslint-plugin-react-hooks` rulesets, we can prevent common React bugs such as missing dependency arrays in hooks or inaccessible DOM nodes natively. ESLint checks for code safety, style correctness, and reduces the chance of unhandled runtime errors.

## Basic Configuration Rules
The rules are defined in the `.eslintrc.js` file at the root of the project. We extend the `react-app` defaults to ensure out-of-the-box compatibility with standard metrics, but we overlay a few strict rules:

### 1. `semi: ["warn", "always"]`
**Explanation**: This enforces the consistent use of semicolons at the end of statements. Dropped semicolons in JS can occasionally lead to Automatic Semicolon Insertion (ASI) bugs.

### 2. `eqeqeq: ["error", "always"]`
**Explanation**: Enforces the use of `===` and `!==` over `==` and `!=`. This avoids unexpected type coercion bugs where JavaScript might loosely evaluate things (e.g. `0 == false` is true, but `0 === false` is false).

### 3. `no-unused-vars: "warn"`
**Explanation**: Flits a warning when a variable is declared but never read. This keeps the codebase clean, optimizes minification processes over time, and usually points out logical omissions by the developer.

### 4. `no-console: "warn"`
**Explanation**: Warnings are emitted for `console.log()` usage. This prevents developers from accidentally pushing unneeded debugging logs to production which clutter the stdout of the app or browser console. If an error console is expressly required, we override it inline using `// eslint-disable-next-line no-console`.

## Ignored Files
We have incorporated an `.eslintignore` file to ensure the linter only parses source code written by the developer. It ignores output directories (`build/`), node modules (`node_modules/`), and environmental data.

## Running the Linter
Global scripts have been setup via `npm` inside `package.json`.

- To run the linter and see a summary of all existing issues across the codebase, execute:
  ```bash
  npm run lint
  ```
  *(Under the hood, this triggers `npx eslint src/**/*.js`)*

- To have ESLint attempt to automatically fix stylistic errors (like missing semicolons or spacing), execute:
  ```bash
  npm run lint:fix
  ```
