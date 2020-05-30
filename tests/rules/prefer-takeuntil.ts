/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-rxjs-angular
 */

import { stripIndent } from "common-tags";
import rule = require("../../source/rules/prefer-takeuntil");
import { ruleTester } from "../utils";

ruleTester({ types: true }).run("prefer-takeuntil", rule, {
  valid: [
    {
      code: stripIndent`
        // correct component
        import { Component, OnDestroy } from "@angular/core";
        import { of, Subject } from "rxjs";
        import { switchMap, takeUntil } from "rxjs/operators";

        const o = of("o");

        @Component({
          selector: "correct-component"
        })
        class CorrectComponent implements OnDestroy {
          private destroy = new Subject<void>();
          someMethod() {
            o.pipe(
              switchMap(_ => o),
              takeUntil(this.destroy)
            ).subscribe();
          }
          ngOnDestroy() {
            this.destroy.next();
            this.destroy.complete();
          }
        }
      `,
    },
    {
      code: stripIndent`
        // destructured component
        import { Component, OnDestroy } from "@angular/core";
        import { of, Subject } from "rxjs";
        import { switchMap, takeUntil } from "rxjs/operators";

        const o = of("o");

        @Component({
          selector: "destructured-component"
        })
        class DestructuredComponent implements OnDestroy {
          private destroy = new Subject<void>();
          someMethod() {
            const { destroy } = this;
            o.pipe(
              switchMap(_ => o),
              takeUntil(destroy)
            ).subscribe();
          }
          ngOnDestroy() {
            const { destroy } = this;
            destroy.next();
            destroy.complete();
          }
        }
      `,
    },
    {
      code: stripIndent`
        // secondary takeuntil component
        import { Component, OnDestroy } from "@angular/core";
        import { of, Subject } from "rxjs";
        import { switchMap, takeUntil } from "rxjs/operators";

        const o = of("o");

        @Component({
          selector: "secondary-takeuntil-component"
        })
        class SecondaryTakeUntilComponent implements OnDestroy {
          private destroy = new Subject<void>();
          someMethod() {
            o.pipe(
              takeUntil(o),
              switchMap(_ => o),
              takeUntil(this.destroy)
            ).subscribe();
          }
          ngOnDestroy() {
            this.destroy.next();
            this.destroy.complete();
          }
        }
      `,
    },
    {
      code: stripIndent`
        // not components
        import { of } from "rxjs";
        import { switchMap, takeUntil } from "rxjs/operators";

        const o = of("o");

        class SomeClass {
          someMethod() {
            o.pipe(switchMap(_ => o)).subscribe();
            o.pipe(switchMap(_ => o), takeUntil(o)).subscribe();
          }
        }

        function someFunction() {
          o.pipe(switchMap(_ => o)).subscribe();
          o.pipe(switchMap(_ => o), takeUntil(o)).subscribe();
        }

        @Injectable()
        class NoTakeUntilService {
          someMethod() {
            o.pipe(
              switchMap(_ => o)
            ).subscribe();
          }
        }

        @Pipe({
          name: 'some-pipe',
        })
        class NoTakeUntilPipe {
          someMethod() {
            o.pipe(
              switchMap(_ => o)
            ).subscribe();
          }
        }

        @Directive({
          selector: 'some-directive'
        })
        class NoTakeUntilDirective {
          someMethod() {
            o.pipe(
              switchMap(_ => o)
            ).subscribe();
          }
        }
      `,
    },
    {
      code: stripIndent`
        // no destroy only takeuntil
        import { Component, OnDestroy } from "@angular/core";
        import { of, Subject } from "rxjs";
        import { switchMap, takeUntil } from "rxjs/operators";

        const o = of("o");

        @Component({
          selector: "only-takeuntil"
        })
        class CorrectComponent {
          someMethod() {
            o.pipe(
              switchMap(_ => o),
              takeUntil(NEVER)
            ).subscribe();
          }
        }
      `,
    },
    {
      code: stripIndent`
        // with alias
        import { Component, OnDestroy } from "@angular/core";
        import { of, Subject } from "rxjs";
        import { switchMap, takeUntil } from "rxjs/operators";

        const o = of("o");
        const someAlias = takeUntil;

        @Component({
          selector: "component-with-alias"
        })
        class CorrectComponent implements OnDestroy {
          private destroy = new Subject<void>();
          someMethod() {
            o.pipe(
              switchMap(_ => o),
              someAlias(this.destroy)
            ).subscribe();
          }
          ngOnDestroy() {
            this.destroy.next();
            this.destroy.complete();
          }
        }
      `,
      options: [{ alias: ["someAlias"] }],
    },
    {
      code: stripIndent`
        // decorators with takeuntil
        import { Component, OnDestroy } from "@angular/core";
        import { of, Subject } from "rxjs";
        import { switchMap, takeUntil } from "rxjs/operators";

        const o = of("o");

        @Component({
          selector: "correct-component"
        })
        class CorrectComponent implements OnDestroy {
          private destroy = new Subject<void>();
          someMethod() {
            o.pipe(
              switchMap(_ => o),
              takeUntil(this.destroy)
            ).subscribe();
          }
          ngOnDestroy() {
            this.destroy.next();
            this.destroy.complete();
          }
        }

        @Injectable()
        class CorrectService implements OnDestroy {
          private destroy = new Subject<void>();
          someMethod() {
            o.pipe(
              switchMap(_ => o)
              takeUntil(this.destroy)
            ).subscribe();
          }
          ngOnDestroy() {
            this.destroy.next();
            this.destroy.complete();
          }
        }

        @Pipe({
          name: 'controlByName',
        })
        class CorrectPipe implements OnDestroy {
          private destroy = new Subject<void>();
          someMethod() {
            o.pipe(
              switchMap(_ => o)
              takeUntil(this.destroy)
            ).subscribe();
          }
          ngOnDestroy() {
            this.destroy.next();
            this.destroy.complete();
          }
        }

        @Directive({
          selector: 'my-directive'
        })
        class CorrectDirective implements OnDestroy {
          private destroy = new Subject<void>();
          someMethod() {
            o.pipe(
              switchMap(_ => o)
              takeUntil(this.destroy)
            ).subscribe();
          }
          ngOnDestroy() {
            this.destroy.next();
            this.destroy.complete();
          }
        }
      `,
      options: [
        {
          checkDecorators: ["Component", "Pipe", "Injectable", "Directive"],
        },
      ],
    },
    {
      code: stripIndent`
        // https://github.com/cartant/rxjs-tslint-rules/issues/115
        import { Component } from "@angular/core";
        import { of, Subject } from "rxjs";
        import { switchMap, takeUntil } from "rxjs/operators";

        const o = of("o");
        const someAlias = (cmp) => takeUntil(cmp.destroy);

        @Component({
          selector: "component-with-alias"
        })
        class CorrectComponent implements OnDestroy {
          private destroy = new Subject<void>();
          someMethod() {
            o.pipe(
              switchMap(_ => o),
              someAlias(this)
            ).subscribe();
          }
          ngOnDestroy() {
            this.destroy.next();
            this.destroy.complete();
          }
        }
      `,
      options: [
        {
          alias: ["someAlias"],
          checkDestroy: false,
        },
      ],
    },
  ],
  invalid: [
    {
      code: stripIndent`
        // no takeuntil component
        import { Component, OnDestroy } from "@angular/core";
        import { of, Subject } from "rxjs";
        import { switchMap, takeUntil } from "rxjs/operators";

        const o = of("o");

        @Component({
          selector: "no-takeuntil-component"
        })
        class NoTakeUntilComponent {
          private destroy = new Subject<void>();
          someMethod() {
            const { destroy } = this;
            o.pipe(
              switchMap(_ => o)
            ).subscribe();
          }
          ngOnDestroy() {
            this.destroy.next();
            this.destroy.complete();
          }
        }
      `,
      errors: [
        {
          messageId: "forbidden",
          line: 17,
          column: 7,
          endLine: 17,
          endColumn: 16,
        },
      ],
    },
    {
      code: stripIndent`
        // no subject component
        import { Component, OnDestroy } from "@angular/core";
        import { of, Subject } from "rxjs";
        import { switchMap, takeUntil } from "rxjs/operators";

        const o = of("o");

        @Component({
          selector: "no-subject-component"
        })
        class NoSubjectComponent implements OnDestroy {
          someMethod() {
            const { destroy } = this;
            o.pipe(
              switchMap(_ => o),
              takeUntil(o)
            ).subscribe();
          }
          ngOnDestroy() {
          }
        }
      `,
      errors: [
        {
          messageId: "forbidden",
          line: 11,
          column: 7,
          endLine: 11,
          endColumn: 25,
        },
        {
          messageId: "forbidden",
          line: 19,
          column: 3,
          endLine: 19,
          endColumn: 14,
        },
        {
          messageId: "forbidden",
          line: 19,
          column: 3,
          endLine: 19,
          endColumn: 14,
        },
      ],
    },
    {
      code: stripIndent`
        // no destroy component
        import { Component, OnDestroy } from "@angular/core";
        import { of, Subject } from "rxjs";
        import { switchMap, takeUntil } from "rxjs/operators";

        const o = of("o");

        @Component({
          selector: "no-destroy-component"
        })
        class NoDestroyComponent {
          private destroy = new Subject<void>();
          someMethod() {
            const { destroy } = this;
            o.pipe(
              switchMap(_ => o),
              takeUntil(destroy)
            ).subscribe();
          }
        }
      `,
      errors: [
        {
          messageId: "forbidden",
          line: 11,
          column: 7,
          endLine: 11,
          endColumn: 25,
        },
      ],
    },
    {
      code: stripIndent`
        // no next component
        import { Component, OnDestroy } from "@angular/core";
        import { of, Subject } from "rxjs";
        import { switchMap, takeUntil } from "rxjs/operators";

        const o = of("o");

        @Component({
          selector: "no-next-component"
        })
        class NoNextComponent implements OnDestroy {
          private destroy = new Subject<void>();
          someMethod() {
            o.pipe(
              switchMap(_ => o),
              takeUntil(this.destroy)
            ).subscribe();
          }
          ngOnDestroy() {
            this.destroy.complete();
          }
        }
      `,
      errors: [
        {
          messageId: "forbidden",
          line: 19,
          column: 3,
          endLine: 19,
          endColumn: 14,
        },
      ],
    },
    {
      code: stripIndent`
        // no complete component
        import { Component, OnDestroy } from "@angular/core";
        import { of, Subject } from "rxjs";
        import { switchMap, takeUntil } from "rxjs/operators";

        const o = of("o");

        @Component({
          selector: "no-complete-component"
        })
        class NoCompleteComponent implements OnDestroy {
          private destroy = new Subject<void>();
          someMethod() {
            o.pipe(
              switchMap(_ => o),
              takeUntil(this.destroy)
            ).subscribe();
          }
          ngOnDestroy() {
            this.destroy.next();
          }
        }
      `,
      errors: [
        {
          messageId: "forbidden",
          line: 19,
          column: 3,
          endLine: 19,
          endColumn: 14,
        },
      ],
    },
    {
      code: stripIndent`
        // no destroy and no takeuntil component
        import { Component, OnDestroy } from "@angular/core";
        import { of, Subject } from "rxjs";
        import { switchMap, takeUntil } from "rxjs/operators";

        const o = of("o");

        @Component({
          selector: "no-takeuntil-component"
        })
        class NoTakeUntilComponent {
          someMethod() {
            o.pipe(
              switchMap(_ => o)
            ).subscribe();
          }
        }
      `,
      errors: [
        {
          messageId: "forbidden",
          line: 15,
          column: 7,
          endLine: 15,
          endColumn: 16,
        },
      ],
    },
    {
      code: stripIndent`
        // without alias
        import { Component, OnDestroy } from "@angular/core";
        import { of, Subject } from "rxjs";
        import { switchMap, takeUntil } from "rxjs/operators";

        const o = of("o");
        const someAlias = takeUntil;

        @Component({
          selector: "component-without-alias"
        })
        class NoTakeUntilComponent {
          private destroy = new Subject<void>();
          someMethod() {
            o.pipe(
              switchMap(_ => o)
            ).subscribe();
          }
          ngOnDestroy() {
            this.destroy.next();
            this.destroy.complete();
          }
        }
      `,
      errors: [
        {
          messageId: "forbidden",
          line: 17,
          column: 7,
          endLine: 17,
          endColumn: 16,
        },
      ],
      options: [{ alias: ["someAlias"] }],
    },
    {
      code: stripIndent`
        // decorators without takeuntil
        import { Component, OnDestroy } from "@angular/core";
        import { of, Subject } from "rxjs";
        import { switchMap, takeUntil } from "rxjs/operators";

        const o = of("o");

        @Component({
          selector: "no-next-component"
        })
        class NoTakeUntilComponent {
          someMethod() {
            o.pipe(
              switchMap(_ => o)
            ).subscribe();
          }
        }

        @Injectable()
        class NoTakeUntilService {
          someMethod() {
            o.pipe(
              switchMap(_ => o)
            ).subscribe();
          }
        }

        @Pipe({
          name: 'controlByName',
        })
        class NoTakeUntilPipe {
          someMethod() {
            o.pipe(
              switchMap(_ => o)
            ).subscribe();
          }
        }

        @Directive({
          selector: 'my-directive'
        })
        class NoTakeUntilDirective {
          someMethod() {
            o.pipe(
              switchMap(_ => o)
            ).subscribe();
          }
        }
      `,
      errors: [
        {
          messageId: "forbidden",
          line: 15,
          column: 7,
          endLine: 15,
          endColumn: 16,
        },
        {
          messageId: "forbidden",
          line: 24,
          column: 7,
          endLine: 24,
          endColumn: 16,
        },
        {
          messageId: "forbidden",
          line: 35,
          column: 7,
          endLine: 35,
          endColumn: 16,
        },
        {
          messageId: "forbidden",
          line: 46,
          column: 7,
          endLine: 46,
          endColumn: 16,
        },
      ],
      options: [
        {
          checkDecorators: ["Component", "Pipe", "Injectable", "Directive"],
        },
      ],
    },
  ],
});
