/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-rxjs-angular
 */

import { stripIndent } from "common-tags";
import { Rule } from "eslint";

const rule: Rule.RuleModule = {
  meta: {
    docs: {
      category: "RxJS",
      description:
        "Forbids `subscribe` calls without an accompanying `takeUntil` within Angular components.",
      recommended: false
    },
    fixable: null,
    messages: {
      forbidden:
        "Calling `subscribe` without an accompanying `takeUntil` is forbidden."
    },
    schema: [
      {
        properties: {
          alias: { type: "array", items: { type: "string" } },
          checkDestroy: { type: "boolean" }
        },
        type: "object",
        description: stripIndent`
          An optional object with optional \`alias\` and \`checkDestroy\` properties.
          The \`alias\` property is an array containing the names of operators that aliases for \`takeUntil\`.
          The \`checkDestroy\` property is a boolean that determines whether or not a \`Subject\`-based \`ngOnDestroy\` must be implemented.`
      }
    ]
  },
  create: context => {
    return {};
  }
};

export = rule;
