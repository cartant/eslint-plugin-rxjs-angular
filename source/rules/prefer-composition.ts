/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-rxjs-angular
 */

import { stripIndent } from "common-tags";
import { Rule } from "eslint";
import * as es from "estree";
import {
  getParent,
  isAssignmentExpression,
  isCallExpression,
  isIdentifier,
  isMemberExpression,
  isVariableDeclarator,
  typecheck,
} from "../utils";

const rule: Rule.RuleModule = {
  meta: {
    docs: {
      category: "RxJS",
      description:
        "Forbids `subscribe` calls that are not composed within Angular components (and, optionally, within services, directives, and pipes).",
      recommended: false,
    },
    fixable: null,
    messages: {
      notComposed: "Subscription not composed.",
      notDeclared: "Composed subscription `{{name}}` not a class property.",
      notImplemented: "`ngOnDestroy` not implemented.",
      notUnsubscribed: "Composed subscription not unsubscribed.",
    },
    schema: [
      {
        properties: {
          checkDecorators: { type: "array", items: { type: "string" } },
        },
        type: "object",
        description: stripIndent`
          An optional object with an optional \`checkDecorators\` property.
          The \`checkDecorators\` property is an array containing the names of the decorators that determine whether or not a class is checked.
        `,
      },
    ],
  },
  create: (context) => {
    const { couldBeObservable, couldBeSubscription } = typecheck(context);
    const [config = {}] = context.options;
    const { checkDecorators = ["Component"] } = config;

    type Record = {
      addCallExpressions: es.CallExpression[];
      classDeclaration: es.ClassDeclaration;
      classProperties: es.Node[];
      hasDecorator: boolean;
      ngOnDestroyDefinition?: es.MethodDefinition;
      subscribeCallExpressions: es.CallExpression[];
      subscriptions: Set<string>;
      unsubscribeCallExpressions: es.CallExpression[];
    };
    const records: Record[] = [];

    function checkRecord(record: Record) {
      const {
        classDeclaration,
        classProperties,
        ngOnDestroyDefinition,
        subscribeCallExpressions,
        subscriptions,
        unsubscribeCallExpressions,
      } = record;

      if (subscribeCallExpressions.length === 0) {
        return;
      }
      subscribeCallExpressions.forEach((callExpression) => {
        const { callee } = callExpression;
        if (isMemberExpression(callee)) {
          const { object, property } = callee;
          if (!couldBeObservable(object)) {
            return;
          }
          if (isComposed(callExpression, record)) {
            return;
          }
          context.report({
            messageId: "notComposed",
            node: property,
          });
        }
      });

      if (!ngOnDestroyDefinition) {
        context.report({
          messageId: "notImplemented",
          node: classDeclaration.id,
        });
        return;
      }

      subscriptions.forEach((subscription) => {
        const classProperty = classProperties.find(
          (classProperty: any) => classProperty.key.name === subscription
        );
        if (!classProperty) {
          context.report({
            data: { name: subscription },
            messageId: "notDeclared",
            node: classDeclaration.id,
          });
          return;
        }

        const callExpression = unsubscribeCallExpressions.find(
          (callExpression) => {
            const name = getMethodCalleeName(callExpression);
            return name === subscription;
          }
        );
        if (!callExpression) {
          context.report({
            data: { name: subscription },
            messageId: "notUnsubscribed",
            node: (classProperty as any).key,
          });
          return;
        }
      });
    }

    function getMethodCalleeName(callExpression: es.CallExpression) {
      const { callee } = callExpression;
      if (isMemberExpression(callee)) {
        const { object } = callee;
        if (isMemberExpression(object) && isIdentifier(object.property)) {
          return object.property.name;
        }
        if (isIdentifier(object)) {
          return object.name;
        }
      }
      return undefined;
    }

    function getMethodCalleeObject(callExpression: es.CallExpression) {
      const { callee } = callExpression;
      if (isMemberExpression(callee)) {
        return callee.object;
      }
      return undefined;
    }

    function getRecord() {
      const { length, [length - 1]: record } = records;
      return record;
    }

    function hasDecorator(node: es.ClassDeclaration) {
      const { decorators } = node as any;
      return (
        decorators &&
        decorators.some((decorator: any) => {
          const { expression } = decorator;
          if (!isCallExpression(expression)) {
            return false;
          }
          if (!isIdentifier(expression.callee)) {
            return false;
          }
          const { name } = expression.callee;
          return checkDecorators.some((check: string) => name === check);
        })
      );
    }

    function isComposed(callExpression: es.CallExpression, record: Record) {
      const { addCallExpressions, subscriptions } = record;
      const parent = getParent(callExpression);
      if (isCallExpression(parent)) {
        const addCallExpression = addCallExpressions.find(
          (callExpression) => callExpression === parent
        );
        if (!addCallExpression) {
          return false;
        }
        const object = getMethodCalleeObject(addCallExpression);
        if (!object || !couldBeSubscription(object)) {
          return false;
        }
        const name = getMethodCalleeName(addCallExpression);
        if (!name) {
          return false;
        }
        subscriptions.add(name);
        return true;
      }
      if (isVariableDeclarator(parent) && isIdentifier(parent.id)) {
        return isVariableComposed(parent.id, record);
      }
      if (
        isAssignmentExpression(parent) &&
        isIdentifier(parent.left) &&
        parent.operator === "="
      ) {
        return isVariableComposed(parent.left, record);
      }
      return false;
    }

    function isVariableComposed(identifier: es.Identifier, record: Record) {
      const { name } = identifier;
      const { addCallExpressions, subscriptions } = record;
      const addCallExpression = addCallExpressions.find(
        (callExpression) => getMethodCalleeName(callExpression) === name
      );
      if (!addCallExpression) {
        return false;
      }
      const object = getMethodCalleeObject(addCallExpression);
      if (!object || !couldBeSubscription(object)) {
        return false;
      }
      subscriptions.add(name);
      return true;
    }

    return {
      "CallExpression[callee.property.name='add']": (
        node: es.CallExpression
      ) => {
        const record = getRecord();
        if (record && record.hasDecorator) {
          record.addCallExpressions.push(node);
        }
      },
      "CallExpression[callee.property.name='subscribe']": (
        node: es.CallExpression
      ) => {
        const record = getRecord();
        if (record && record.hasDecorator) {
          record.subscribeCallExpressions.push(node);
        }
      },
      "CallExpression[callee.property.name='unsubscribe']": (
        node: es.CallExpression
      ) => {
        const record = getRecord();
        if (record && record.hasDecorator) {
          record.unsubscribeCallExpressions.push(node);
        }
      },
      ClassDeclaration: (node: es.ClassDeclaration) => {
        records.push({
          addCallExpressions: [],
          classDeclaration: node,
          classProperties: [],
          hasDecorator: hasDecorator(node),
          subscribeCallExpressions: [],
          subscriptions: new Set<string>(),
          unsubscribeCallExpressions: [],
        });
      },
      "ClassDeclaration:exit": (node: es.ClassDeclaration) => {
        const record = records.pop();
        if (record && record.hasDecorator) {
          checkRecord(record);
        }
      },
      ClassProperty: (node: es.Node) => {
        const record = getRecord();
        if (record && record.hasDecorator) {
          record.classProperties.push(node);
        }
      },
      "MethodDefinition[key.name='ngOnDestroy'][kind='method']": (
        node: es.MethodDefinition
      ) => {
        const record = getRecord();
        if (record && record.hasDecorator) {
          record.ngOnDestroyDefinition = node;
        }
      },
    };
  },
};

export = rule;
