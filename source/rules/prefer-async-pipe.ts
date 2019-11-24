/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-rxjs-angular
 */

import { Rule } from "eslint";
import { query } from "eslint-etc";
import * as es from "estree";
import { getParent, typecheck } from "../utils";

const rule: Rule.RuleModule = {
  meta: {
    docs: {
      category: "RxJS",
      description:
        "Forbids the calling of `subscribe` within Angular components.",
      recommended: false
    },
    fixable: null,
    messages: {
      forbidden:
        "Calling `subscribe` in a component is forbidden; use an `async` pipe instead."
    },
    schema: []
  },
  create: context => {
    const { couldBeObservable } = typecheck(context);
    return {
      [`ClassDeclaration > Decorator[expression.callee.name="Component"]`]: (
        node: es.Node
      ) => {
        const classDeclaration = getParent(node) as es.ClassDeclaration;
        const memberExpressions = query(
          classDeclaration,
          `CallExpression > MemberExpression[property.name="subscribe"]`
        ) as es.MemberExpression[];
        memberExpressions.forEach(memberExpression => {
          if (couldBeObservable(memberExpression.object)) {
            context.report({
              messageId: "forbidden",
              node: memberExpression.property
            });
          }
        });
      }
    };
  }
};

export = rule;
