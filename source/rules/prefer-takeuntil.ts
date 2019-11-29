/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-rxjs-angular
 */

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
    schema: []
  },
  create: context => {
    return {};
  }
};

export = rule;
