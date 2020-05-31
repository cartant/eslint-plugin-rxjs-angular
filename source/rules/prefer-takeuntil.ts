/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-rxjs-angular
 */

import { stripIndent } from "common-tags";
import { Rule } from "eslint";
import * as es from "estree";

const rule: Rule.RuleModule = {
  meta: {
    docs: {
      category: "RxJS",
      description:
        "Forbids `subscribe` calls without an accompanying `takeUntil` within Angular components (and, optionally, within services, directives, and pipes).",
      recommended: false,
    },
    fixable: null,
    messages: {
      noDestroy: "`ngOnDestroy` is not implemented.",
      noTakeUntil:
        "Calling `subscribe` without an accompanying `takeUntil` is forbidden.",
      notCalled: "`{{name}}.{{method}}()` not called.",
      notDeclared: "Subject `{{name}}` not a class property.",
    },
    schema: [
      {
        properties: {
          alias: { type: "array", items: { type: "string" } },
          checkDecorators: { type: "array", items: { type: "string" } },
          checkDestroy: { type: "boolean" },
        },
        type: "object",
        description: stripIndent`
          An optional object with optional \`alias\`, \`checkDecorators\` and \`checkDestroy\` properties.
          The \`alias\` property is an array containing the names of operators that aliases for \`takeUntil\`.
          The \`checkDecorators\` property is an array containing the names of the decorators that determine whether or not a class is checked.
          The \`checkDestroy\` property is a boolean that determines whether or not a \`Subject\`-based \`ngOnDestroy\` must be implemented.
        `,
      },
    ],
  },
  create: (context) => {
    return {
      "CallExpression[callee.property.name='subscribe']": (
        node: es.CallExpression
      ) => {},
      ClassDeclaration: (node: es.ClassDeclaration) => {},
      "ClassDeclaration:exit": (node: es.ClassDeclaration) => {},
      ClassProperty: (node: es.Node) => {},
      "MethodDefinition[key.name='ngOnDestroy'][kind='method']": (
        node: es.MethodDefinition
      ) => {},
    };
  },
};

export = rule;
/*
type Options = {
  alias: string[];
  checkDestroy: boolean;
  checkDecorators: string[];
};

public applyWithProgram(
  sourceFile: ts.SourceFile,
  program: ts.Program
): Lint.RuleFailure[] {
  const failures: Lint.RuleFailure[] = [];
  const {
    ruleArguments: [options]
  } = this.getOptions();
  // If an alias is specified, check for the subject-based destroy only if
  // it's explicitly configured. It's extremely unlikely a subject-based
  // destroy mechanism will be used in conjunction with an alias.
  const {
    alias = [],
    checkDestroy = alias.length === 0,
    checkDecorators = ["Component"]
  }: Options = options || {};

  // find all classes with given decorators
  const decoratorQuery = `/^(${checkDecorators.join("|")})$/`;
  const classDeclarations = tsquery(
    sourceFile,
    `ClassDeclaration:has(Decorator[expression.expression.name=${decoratorQuery}])`
  ) as ts.ClassDeclaration[];
  classDeclarations.forEach(classDeclaration => {
    failures.push(
      ...this.checkClassDeclaration(
        sourceFile,
        program,
        { alias, checkDestroy, checkDecorators },
        classDeclaration
      )
    );
  });

  return failures;
}

/**
 * Checks a class for occurrences of .subscribe() and corresponding takeUntil() requirements
 * /
private checkClassDeclaration(
  sourceFile: ts.SourceFile,
  program: ts.Program,
  options: Options,
  classDeclaration: ts.ClassDeclaration
): Lint.RuleFailure[] {
  const failures: Lint.RuleFailure[] = [];
  const typeChecker = program.getTypeChecker();
  const destroySubjectNamesBySubscribes = new Map<
    ts.Identifier | ts.PrivateIdentifier,
    Set<string>
  >();

  // find observable.subscribe() call expressions
  const subscribePropertyAccessExpressions = tsquery(
    classDeclaration,
    `CallExpression > PropertyAccessExpression[name.name="subscribe"]`
  ) as ts.PropertyAccessExpression[];

  // check whether it is an observable and check the takeUntil is applied
  subscribePropertyAccessExpressions.forEach(propertyAccessExpression => {
    const type = typeChecker.getTypeAtLocation(
      propertyAccessExpression.expression
    );
    if (couldBeType(type, "Observable")) {
      failures.push(
        ...this.checkSubscribe(
          sourceFile,
          options,
          propertyAccessExpression,
          name => {
            let names = destroySubjectNamesBySubscribes.get(
              propertyAccessExpression.name
            );
            if (!names) {
              names = new Set<string>();
              destroySubjectNamesBySubscribes.set(
                propertyAccessExpression.name,
                names
              );
            }
            names.add(name);
          }
        )
      );
    }
  });

  // check the ngOnDestroyMethod
  if (options.checkDestroy && destroySubjectNamesBySubscribes.size > 0) {
    failures.push(
      ...this.checkNgOnDestroy(
        sourceFile,
        classDeclaration,
        destroySubjectNamesBySubscribes
      )
    );
  }

  return failures;
}

/**
 * Checks whether a .subscribe() is preceded by a .pipe(<...>, takeUntil(<...>))
 * /
private checkSubscribe(
  sourceFile: ts.SourceFile,
  options: Options,
  subscribe: ts.PropertyAccessExpression,
  addDestroySubjectName: (name: string) => void
): Lint.RuleFailure[] {
  const failures: Lint.RuleFailure[] = [];
  const subscribeContext = subscribe.expression;
  let takeUntilFound = false;

  // check whether subscribeContext.expression is <something>.pipe()
  if (
    tsutils.isCallExpression(subscribeContext) &&
    tsutils.isPropertyAccessExpression(subscribeContext.expression) &&
    subscribeContext.expression.name.text === "pipe"
  ) {
    const pipedOperators = subscribeContext.arguments;
    pipedOperators.forEach(pipedOperator => {
      if (tsutils.isCallExpression(pipedOperator)) {
        const { found, name } = this.checkOperator(options, pipedOperator);
        takeUntilFound = found;
        if (name) {
          addDestroySubjectName(name);
        }
      }
    });
  }

  // add failure if there is no takeUntil() in the .pipe()
  if (!takeUntilFound) {
    failures.push(
      new Lint.RuleFailure(
        sourceFile,
        subscribe.name.getStart(),
        subscribe.name.getStart() + subscribe.name.getWidth(),
        Rule.FAILURE_STRING_NO_TAKEUNTIL,
        this.ruleName
      )
    );
  }
  return failures;
}

/**
 * Checks whether the operator given is takeUntil and uses an expected destroy subject name
 * /
private checkOperator(
  options: Options,
  operator: ts.CallExpression
): {
  found: boolean;
  name?: string;
} {
  if (!tsutils.isIdentifier(operator.expression)) {
    return { found: false };
  }
  if (
    operator.expression.text === "takeUntil" ||
    options.alias.includes(operator.expression.text)
  ) {
    const [arg] = operator.arguments;
    if (arg) {
      if (ts.isPropertyAccessExpression(arg) && isThis(arg.expression)) {
        return { found: true, name: arg.name.text };
      } else if (arg && ts.isIdentifier(arg)) {
        return { found: true, name: arg.text };
      }
    }
    if (!options.checkDestroy) {
      return { found: true };
    }
  }
  return { found: false };
}

/**
 * Checks whether the class implements an ngOnDestroy method and invokes .next() and .complete() on the destroy subjects
 * /
private checkNgOnDestroy(
  sourceFile: ts.SourceFile,
  classDeclaration: ts.ClassDeclaration,
  destroySubjectNamesBySubscribes: Map<
    ts.Identifier | ts.PrivateIdentifier,
    Set<string>
  >
): Lint.RuleFailure[] {
  const failures: Lint.RuleFailure[] = [];
  const ngOnDestroyMethod = classDeclaration.members.find(
    member => member.name && member.name.getText() === "ngOnDestroy"
  );

  // check whether the ngOnDestroy method is implemented
  // and contains invocations of .next() and .complete() on destroy subjects
  if (ngOnDestroyMethod) {
    // If a subscription to a .pipe() has at least one takeUntil that has no
    // failures, the subscribe call is fine. Callers should be able to use
    // secondary takUntil operators. However, there must be at least one
    // takeUntil operator that conforms to the pattern that this rule enforces.
    const destroySubjectNames = new Set<string>();
    destroySubjectNamesBySubscribes.forEach(names =>
      names.forEach(name => destroySubjectNames.add(name))
    );

    const destroySubjectResultsByName = new Map<
      string,
      { failures: Lint.RuleFailure[]; report: boolean }
    >();
    destroySubjectNames.forEach(name => {
      destroySubjectResultsByName.set(name, {
        failures: [
          ...this.checkDestroySubjectDeclaration(
            sourceFile,
            classDeclaration,
            name
          ),
          ...this.checkDestroySubjectMethodInvocation(
            sourceFile,
            ngOnDestroyMethod,
            name,
            "next"
          ),
          ...this.checkDestroySubjectMethodInvocation(
            sourceFile,
            ngOnDestroyMethod,
            name,
            "complete"
          )
        ],
        report: false
      });
    });

    destroySubjectNamesBySubscribes.forEach(names => {
      const report = [...names].every(
        name => destroySubjectResultsByName.get(name).failures.length > 0
      );
      if (report) {
        names.forEach(
          name => (destroySubjectResultsByName.get(name).report = true)
        );
      }
    });

    destroySubjectResultsByName.forEach(result => {
      if (result.report) {
        failures.push(...result.failures);
      }
    });
  } else {
    failures.push(
      new Lint.RuleFailure(
        sourceFile,
        classDeclaration.name.getStart(),
        classDeclaration.name.getStart() + classDeclaration.name.getWidth(),
        Rule.FAILURE_STRING_NO_DESTROY,
        this.ruleName
      )
    );
  }
  return failures;
}

private checkDestroySubjectDeclaration(
  sourceFile: ts.SourceFile,
  classDeclaration: ts.ClassDeclaration,
  destroySubjectName: string
) {
  const failures: Lint.RuleFailure[] = [];
  const propertyDeclarations = tsquery(
    classDeclaration,
    `PropertyDeclaration[name.text="${destroySubjectName}"]`
  ) as ts.PropertyDeclaration[];
  if (propertyDeclarations.length === 0) {
    const { name } = classDeclaration;
    failures.push(
      new Lint.RuleFailure(
        sourceFile,
        name.getStart(),
        name.getStart() + name.getWidth(),
        Rule.FAILURE_MESSAGE_NOT_DECLARED(destroySubjectName),
        this.ruleName
      )
    );
  }
  return failures;
}

/**
 * Checks whether all <destroySubjectNameUsed>.<methodName>() are invoked in the ngOnDestroyMethod
 * /
private checkDestroySubjectMethodInvocation(
  sourceFile: ts.SourceFile,
  ngOnDestroyMethod: ts.ClassElement,
  destroySubjectName: string,
  methodName: string
) {
  const failures: Lint.RuleFailure[] = [];
  const destroySubjectMethodInvocations = tsquery(
    ngOnDestroyMethod,
    `CallExpression > PropertyAccessExpression[name.name="${methodName}"]`
  ) as ts.PropertyAccessExpression[];
  // check whether there is one invocation of <destroySubjectName>.<methodName>()
  if (
    !destroySubjectMethodInvocations.some(
      methodInvocation =>
        (tsutils.isPropertyAccessExpression(methodInvocation.expression) &&
          isThis(methodInvocation.expression.expression) &&
          methodInvocation.expression.name.text === destroySubjectName) ||
        (tsutils.isIdentifier(methodInvocation.expression) &&
          methodInvocation.expression.text === destroySubjectName)
    )
  ) {
    failures.push(
      new Lint.RuleFailure(
        sourceFile,
        ngOnDestroyMethod.name.getStart(),
        ngOnDestroyMethod.name.getStart() + ngOnDestroyMethod.name.getWidth(),
        Rule.FAILURE_MESSAGE_NOT_CALLED(destroySubjectName, methodName),
        this.ruleName
      )
    );
  }
  return failures;
}
*/
