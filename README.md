# eslint-plugin-rxjs-angular

[![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/cartant/eslint-plugin-rxjs-angular/blob/master/LICENSE)
[![NPM version](https://img.shields.io/npm/v/eslint-plugin-rxjs-angular.svg)](https://www.npmjs.com/package/eslint-plugin-rxjs-angular)
[![Downloads](http://img.shields.io/npm/dm/eslint-plugin-rxjs-angular.svg)](https://npmjs.org/package/eslint-plugin-rxjs-angular)
[![Build status](https://img.shields.io/circleci/build/github/cartant/eslint-plugin-rxjs-angular?token=d3e3fd6613244558287da156fd9e0c4357a2170c)](https://app.circleci.com/pipelines/github/cartant)
[![dependency status](https://img.shields.io/david/cartant/eslint-plugin-rxjs-angular.svg)](https://david-dm.org/cartant/eslint-plugin-rxjs-angular)
[![devDependency Status](https://img.shields.io/david/dev/cartant/eslint-plugin-rxjs-angular.svg)](https://david-dm.org/cartant/eslint-plugin-rxjs-angular#info=devDependencies)
[![peerDependency Status](https://img.shields.io/david/peer/cartant/eslint-plugin-rxjs-angular.svg)](https://david-dm.org/cartant/eslint-plugin-rxjs-angular#info=peerDependencies)

This package contains ESLint versions of the Angular/RxJS rules that are in the [`rxjs-tslint-rules`](https://github.com/cartant/rxjs-tslint-rules) package.

There is no recommended configuration for this package, as all of the rules are opinionated.

# Install

Install the ESLint TypeScript parser using npm:

```
npm install @typescript-eslint/parser --save-dev
```

Install the package using npm:

```
npm install eslint-plugin-rxjs-angular --save-dev
```

Configure the `parser` and the `parserOptions` for ESLint. Here, I use a `.eslintrc.js` file for the configuration:

```js
const { join } = require("path");
module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2019,
    project: join(__dirname, "./tsconfig.json"),
    sourceType: "module"
  },
  plugins: ["rxjs-angular"],
  extends: [],
  rules: {
    "rxjs-angular/prefer-async-pipe": "error"
  }
};
```

# Rules

The package includes the following rules:

| Rule | Description | Recommended |
| --- | --- | --- |
| [`prefer-async-pipe`](https://github.com/cartant/eslint-plugin-rxjs-angular/blob/main/docs/rules/prefer-async-pipe.md) | Forbids the calling of `subscribe` within Angular components. | No |
| [`prefer-composition`](https://github.com/cartant/eslint-plugin-rxjs-angular/blob/main/docs/rules/prefer-composition.md) | Forbids `subscribe` calls that are not composed within Angular components (and, optionally, within services, directives, and pipes). | No |
| [`prefer-takeuntil`](https://github.com/cartant/eslint-plugin-rxjs-angular/blob/main/docs/rules/prefer-takeuntil.md) | Forbids Calling `subscribe` without an accompanying `takeUntil`. | No |