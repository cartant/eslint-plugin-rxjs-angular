# eslint-plugin-rxjs-angular

This repo is a WIP.

Eventually, it will contain ESLint versions of the Angular rules in the [`rxjs-tslint-rules`](https://github.com/cartant/rxjs-tslint-rules) package.

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
[`prefer-async-pipe`](https://github.com/cartant/eslint-plugin-rxjs-angular/blob/master/source/rules/prefer-async-pipe.ts) | Forbids the calling of `subscribe` within Angular components. | TBD |
[`prefer-composition`](https://github.com/cartant/eslint-plugin-rxjs-angular/blob/master/source/rules/prefer-composition.ts) | Not yet implemented. | TBD |
[`prefer-takeuntil`](https://github.com/cartant/eslint-plugin-rxjs-angular/blob/master/source/rules/prefer-takeuntil.ts) | Not yet implemented. | TBD |