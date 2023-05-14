/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-rxjs-angular
 */

import { stripIndent } from "common-tags";
import { fromFixture } from "eslint-etc";
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
        // correct component with Private JavaScript property
        import { Component, OnDestroy } from "@angular/core";
        import { of, Subject } from "rxjs";
        import { switchMap, takeUntil } from "rxjs/operators";

        const o = of("o");

        @Component({
          selector: "correct-component"
        })
        class CorrectComponent implements OnDestroy {
          #destroy = new Subject<void>();
          someMethod() {
            o.pipe(
              switchMap(_ => o),
              takeUntil(this.#destroy)
            ).subscribe();
          }
          ngOnDestroy() {
            this.#destroy.next();
            this.#destroy.complete();
          }
        }
      `,
    },
    {
      code: stripIndent`
        // correct component, not last
        import { Component, OnDestroy } from "@angular/core";
        import { of, Subject } from "rxjs";
        import { map, switchMap, takeUntil } from "rxjs/operators";

        const o = of("o");

        @Component({
          selector: "correct-component"
        })
        class CorrectComponent implements OnDestroy {
          private destroy = new Subject<void>();
          someMethod() {
            o.pipe(
              switchMap(_ => o),
              takeUntil(this.destroy),
              map(value => value)
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
        // correct component, not last with Private JavaScript property
        import { Component, OnDestroy } from "@angular/core";
        import { of, Subject } from "rxjs";
        import { map, switchMap, takeUntil } from "rxjs/operators";

        const o = of("o");

        @Component({
          selector: "correct-component"
        })
        class CorrectComponent implements OnDestroy {
          #destroy = new Subject<void>();
          someMethod() {
            o.pipe(
              switchMap(_ => o),
              takeUntil(this.#destroy),
              map(value => value)
            ).subscribe();
          }
          ngOnDestroy() {
            this.#destroy.next();
            this.#destroy.complete();
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
        // secondary takeuntil component with Private JavaScript property
        import { Component, OnDestroy } from "@angular/core";
        import { of, Subject } from "rxjs";
        import { switchMap, takeUntil } from "rxjs/operators";

        const o = of("o");

        @Component({
          selector: "secondary-takeuntil-component"
        })
        class SecondaryTakeUntilComponent implements OnDestroy {
          #destroy = new Subject<void>();
          someMethod() {
            o.pipe(
              takeUntil(o),
              switchMap(_ => o),
              takeUntil(this.#destroy)
            ).subscribe();
          }
          ngOnDestroy() {
            this.#destroy.next();
            this.#destroy.complete();
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
      options: [{ checkDestroy: false }],
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
        // with alias with Private JavaScript property
        import { Component, OnDestroy } from "@angular/core";
        import { of, Subject } from "rxjs";
        import { switchMap, takeUntil } from "rxjs/operators";

        const o = of("o");
        const someAlias = takeUntil;

        @Component({
          selector: "component-with-alias"
        })
        class CorrectComponent implements OnDestroy {
          #destroy = new Subject<void>();
          someMethod() {
            o.pipe(
              switchMap(_ => o),
              someAlias(this.#destroy)
            ).subscribe();
          }
          ngOnDestroy() {
            this.#destroy.next();
            this.#destroy.complete();
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
              switchMap(_ => o),
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
              switchMap(_ => o),
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
      options: [
        {
          checkDecorators: ["Component", "Pipe", "Injectable", "Directive"],
        },
      ],
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
          #destroy = new Subject<void>();
          someMethod() {
            o.pipe(
              switchMap(_ => o),
              takeUntil(this.#destroy)
            ).subscribe();
          }
          ngOnDestroy() {
            this.#destroy.next();
            this.#destroy.complete();
          }
        }

        @Injectable()
        class CorrectService implements OnDestroy {
          #destroy = new Subject<void>();
          someMethod() {
            o.pipe(
              switchMap(_ => o),
              takeUntil(this.#destroy)
            ).subscribe();
          }
          ngOnDestroy() {
            this.#destroy.next();
            this.#destroy.complete();
          }
        }

        @Pipe({
          name: 'controlByName',
        })
        class CorrectPipe implements OnDestroy {
          #destroy = new Subject<void>();
          someMethod() {
            o.pipe(
              switchMap(_ => o),
              takeUntil(this.#destroy)
            ).subscribe();
          }
          ngOnDestroy() {
            this.#destroy.next();
            this.#destroy.complete();
          }
        }

        @Directive({
          selector: 'my-directive'
        })
        class CorrectDirective implements OnDestroy {
          #destroy = new Subject<void>();
          someMethod() {
            o.pipe(
              switchMap(_ => o),
              takeUntil(this.#destroy)
            ).subscribe();
          }
          ngOnDestroy() {
            this.#destroy.next();
            this.#destroy.complete();
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
    {
      code: stripIndent`
        // https://github.com/cartant/rxjs-tslint-rules/issues/115 with Private JavaScript property
        import { Component } from "@angular/core";
        import { of, Subject } from "rxjs";
        import { switchMap, takeUntil } from "rxjs/operators";

        const o = of("o");
        const someAlias = (cmp) => takeUntil(cmp.destroy);

        @Component({
          selector: "component-with-alias"
        })
        class CorrectComponent implements OnDestroy {
          #destroy = new Subject<void>();
          someMethod() {
            o.pipe(
              switchMap(_ => o),
              someAlias(this)
            ).subscribe();
          }
          ngOnDestroy() {
            this.#destroy.next();
            this.#destroy.complete();
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
    {
      code: stripIndent`
        // https://github.com/cartant/eslint-plugin-rxjs-angular/issues/5
        import { Component } from "@angular/core";
        import { of } from "rxjs";
        import { switchMap, take } from "rxjs/operators";

        const o = of("o");

        @Component({
          selector: "component-with-alias"
        })
        class CorrectComponent implements OnDestroy {
          someMethod() {
            o.pipe(
              switchMap(_ => o),
              take(1)
            ).subscribe();
          }
        }
      `,
      options: [
        {
          alias: ["take"],
          checkDestroy: false,
        },
      ],
    },
  ],
  invalid: [
    fromFixture(
      stripIndent`
        // no pipe component
        import { Component, OnDestroy } from "@angular/core";
        import { of, Subject } from "rxjs";
        import { switchMap, takeUntil } from "rxjs/operators";

        const o = of("o");

        @Component({
          selector: "no-pipe-component"
        })
        class NoPipeComponent {
          private destroy = new Subject<void>();
          someMethod() {
            const { destroy } = this;
            o.subscribe();
              ~~~~~~~~~ [noTakeUntil]
          }
          ngOnDestroy() {
            this.destroy.next();
            this.destroy.complete();
          }
        }
      `,
      { options: [{ checkComplete: true }] }
    ),
    fromFixture(
      stripIndent`
        // no pipe component with Private JavaScript property
        import { Component, OnDestroy } from "@angular/core";
        import { of, Subject } from "rxjs";
        import { switchMap, takeUntil } from "rxjs/operators";

        const o = of("o");

        @Component({
          selector: "no-pipe-component"
        })
        class NoPipeComponent {
          #destroy = new Subject<void>();
          someMethod() {
            o.subscribe();
              ~~~~~~~~~ [noTakeUntil]
          }
          ngOnDestroy() {
            this.#destroy.next();
            this.#destroy.complete();
          }
        }
      `,
      { options: [{ checkComplete: true }] }
    ),
    fromFixture(
      stripIndent`
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
              ~~~~~~~~~ [noTakeUntil]
          }
          ngOnDestroy() {
            this.destroy.next();
            this.destroy.complete();
          }
        }
      `,
      { options: [{ checkComplete: true }] }
    ),
    fromFixture(
      stripIndent`
        // no takeuntil component with Private JavaScript property
        import { Component, OnDestroy } from "@angular/core";
        import { of, Subject } from "rxjs";
        import { switchMap, takeUntil } from "rxjs/operators";

        const o = of("o");

        @Component({
          selector: "no-takeuntil-component"
        })
        class NoTakeUntilComponent {
          #destroy = new Subject<void>();
          someMethod() {
            o.pipe(
              switchMap(_ => o)
            ).subscribe();
              ~~~~~~~~~ [noTakeUntil]
          }
          ngOnDestroy() {
            this.#destroy.next();
            this.#destroy.complete();
          }
        }
      `,
      { options: [{ checkComplete: true }] }
    ),
    fromFixture(
      stripIndent`
        // no subject component
        import { Component, OnDestroy } from "@angular/core";
        import { of, Subject } from "rxjs";
        import { switchMap, takeUntil } from "rxjs/operators";

        const o = of("o");

        @Component({
          selector: "no-subject-component"
        })
        class NoSubjectComponent implements OnDestroy {
              ~~~~~~~~~~~~~~~~~~ [notDeclared { "name": "o" }]
          someMethod() {
            o.pipe(
              switchMap(_ => o),
              takeUntil(o)
            ).subscribe();
          }
          ngOnDestroy() {
          ~~~~~~~~~~~ [notCalled { "method": "next", "name": "o" }]
          ~~~~~~~~~~~ [notCalled { "method": "complete", "name": "o" }]
          }
        }
      `,
      { options: [{ checkComplete: true }] }
    ),
    fromFixture(
      stripIndent`
        // no destroy component
        import { Component, OnDestroy } from "@angular/core";
        import { of, Subject } from "rxjs";
        import { switchMap, takeUntil } from "rxjs/operators";

        const o = of("o");

        @Component({
          selector: "no-destroy-component"
        })
        class NoDestroyComponent {
              ~~~~~~~~~~~~~~~~~~ [noDestroy]
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
      { options: [{ checkComplete: true }] }
    ),
    fromFixture(
      stripIndent`
        // no destroy component
        import { Component, OnDestroy } from "@angular/core";
        import { of, Subject } from "rxjs";
        import { switchMap, takeUntil } from "rxjs/operators";

        const o = of("o");

        @Component({
          selector: "no-destroy-component"
        })
        class NoDestroyComponent {
              ~~~~~~~~~~~~~~~~~~ [noDestroy]
          #destroy = new Subject<void>();
          someMethod() {
            o.pipe(
              switchMap(_ => o),
              takeUntil(this.#destroy)
            ).subscribe();
          }
        }
      `,
      { options: [{ checkComplete: true }] }
    ),
    fromFixture(
      stripIndent`
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
          ~~~~~~~~~~~ [notCalled { "method": "next", "name": "destroy" }]
            this.destroy.complete();
          }
        }
      `,
      { options: [{ checkComplete: true }] }
    ),
    fromFixture(
      stripIndent`
        // no next component with Private JavaScript property
        import { Component, OnDestroy } from "@angular/core";
        import { of, Subject } from "rxjs";
        import { switchMap, takeUntil } from "rxjs/operators";

        const o = of("o");

        @Component({
          selector: "no-next-component"
        })
        class NoNextComponent implements OnDestroy {
          #destroy = new Subject<void>();
          someMethod() {
            o.pipe(
              switchMap(_ => o),
              takeUntil(this.#destroy)
            ).subscribe();
          }
          ngOnDestroy() {
          ~~~~~~~~~~~ [notCalled { "method": "next", "name": "destroy" }]
            this.#destroy.complete();
          }
        }
      `,
      { options: [{ checkComplete: true }] }
    ),
    fromFixture(
      stripIndent`
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
          ~~~~~~~~~~~ [notCalled { "method": "complete", "name": "destroy" }]
            this.destroy.next();
          }
        }
      `,
      { options: [{ checkComplete: true }] }
    ),
    fromFixture(
      stripIndent`
        // no complete component with Private JavaScript property
        import { Component, OnDestroy } from "@angular/core";
        import { of, Subject } from "rxjs";
        import { switchMap, takeUntil } from "rxjs/operators";

        const o = of("o");

        @Component({
          selector: "no-complete-component"
        })
        class NoCompleteComponent implements OnDestroy {
          #destroy = new Subject<void>();
          someMethod() {
            o.pipe(
              switchMap(_ => o),
              takeUntil(this.#destroy)
            ).subscribe();
          }
          ngOnDestroy() {
          ~~~~~~~~~~~ [notCalled { "method": "complete", "name": "destroy" }]
            this.#destroy.next();
          }
        }
      `,
      { options: [{ checkComplete: true }] }
    ),
    fromFixture(
      stripIndent`
        // no destroy and no takeuntil component
        import { Component, OnDestroy } from "@angular/core";
        import { of, Subject } from "rxjs";
        import { switchMap, takeUntil } from "rxjs/operators";

        const o = of("o");

        @Component({
          selector: "no-takeuntil-component"
        })
        class NoTakeUntilComponent {
              ~~~~~~~~~~~~~~~~~~~~ [noDestroy]
          someMethod() {
            o.pipe(
              switchMap(_ => o)
            ).subscribe();
              ~~~~~~~~~ [noTakeUntil]
          }
        }
      `,
      { options: [{ checkComplete: true }] }
    ),
    fromFixture(
      stripIndent`
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
              ~~~~~~~~~ [noTakeUntil]
          }
          ngOnDestroy() {
            this.destroy.next();
            this.destroy.complete();
          }
        }
      `,
      { options: [{ alias: ["someAlias"] }] }
    ),
    fromFixture(
      stripIndent`
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
          #destroy = new Subject<void>();
          someMethod() {
            o.pipe(
              switchMap(_ => o)
            ).subscribe();
              ~~~~~~~~~ [noTakeUntil]
          }
          ngOnDestroy() {
            this.#destroy.next();
            this.#destroy.complete();
          }
        }
      `,
      { options: [{ alias: ["someAlias"] }] }
    ),
    fromFixture(
      stripIndent`
        // decorators without takeuntil
        import { Component, OnDestroy } from "@angular/core";
        import { of, Subject } from "rxjs";
        import { switchMap, takeUntil } from "rxjs/operators";

        const o = of("o");

        @Component({
          selector: "no-next-component"
        })
        class NoTakeUntilComponent {
              ~~~~~~~~~~~~~~~~~~~~ [noDestroy]
          someMethod() {
            o.pipe(
              switchMap(_ => o)
            ).subscribe();
              ~~~~~~~~~ [noTakeUntil]
          }
        }

        @Injectable()
        class NoTakeUntilService {
              ~~~~~~~~~~~~~~~~~~ [noDestroy]
          someMethod() {
            o.pipe(
              switchMap(_ => o)
            ).subscribe();
              ~~~~~~~~~ [noTakeUntil]
          }
        }

        @Pipe({
          name: 'controlByName',
        })
        class NoTakeUntilPipe {
              ~~~~~~~~~~~~~~~ [noDestroy]
          someMethod() {
            o.pipe(
              switchMap(_ => o)
            ).subscribe();
              ~~~~~~~~~ [noTakeUntil]
          }
        }

        @Directive({
          selector: 'my-directive'
        })
        class NoTakeUntilDirective {
              ~~~~~~~~~~~~~~~~~~~~ [noDestroy]
          someMethod() {
            o.pipe(
              switchMap(_ => o)
            ).subscribe();
              ~~~~~~~~~ [noTakeUntil]
          }
        }
      `,
      {
        options: [
          {
            checkDecorators: ["Component", "Pipe", "Injectable", "Directive"],
          },
        ],
      }
    ),
  ],
});
