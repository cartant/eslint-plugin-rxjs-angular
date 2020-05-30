/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-rxjs-angular
 */

import { stripIndent } from "common-tags";
import rule = require("../../source/rules/prefer-composition");
import { ruleTester } from "../utils";

ruleTester({ types: true }).run("prefer-composition", rule, {
  valid: [
    {
      code: stripIndent`
        // composed component
        import { Component, OnDestroy, OnInit } from "@angular/core";
        import { of, Subscription } from "rxjs";

        @Component({
          selector: "composed-component",
          template: "<span>{{ value }}</span>"
        })
        export class ComposedComponent implements OnInit, OnDestroy {
          value: string;
          private subscription = new Subscription();
          ngOnInit() {
            this.subscription.add(of("foo").subscribe(value => this.value = value));
          }
          ngOnDestroy() {
            this.subscription.unsubscribe();
          }
        }
      `,
    },
    {
      code: stripIndent`
        // variable composed component
        import { Component, OnDestroy, OnInit } from "@angular/core";
        import { of, Subscription } from "rxjs";

        @Component({
          selector: "variable-composed-component",
          template: "<span>{{ value }}</span>"
        })
        export class VariableComposedComponent implements OnInit, OnDestroy {
          value: string;
          private subscription = new Subscription();
          ngOnInit() {
            let subscription = of("foo").subscribe(value => this.value = value);
            this.subscription.add(subscription);1
            subscription = of("bar").subscribe(value => this.value = value);
            this.subscription.add(subscription);
          }
          ngOnDestroy() {
            this.subscription.unsubscribe();
          }
        }
      `,
    },
    {
      code: stripIndent`
        // destructured composed component
        import { Component, OnDestroy, OnInit } from "@angular/core";
        import { of, Subscription } from "rxjs";

        @Component({
          selector: "destructured-composed-component",
          template: "<span>{{ value }}</span>"
        })
        export class DestructuredComposedComponent implements OnInit, OnDestroy {
          value: string;
          private subscription = new Subscription();
          ngOnInit() {
            const { subscription } = this;
            subscription.add(of("foo").subscribe(value => this.value = value));
          }
          ngOnDestroy() {
            const { subscription } = this;
            subscription.unsubscribe();
          }
        }
      `,
    },
    {
      code: stripIndent`
        // not a component
        import { of } from "rxjs";

        class SomeClass {
          value: string;
          someMethod() {
            of("foo").subscribe(value => this.value = value);
          }
        }

        function someFunction() {
          of("foo").subscribe(value => this.value = value);
        }
      `,
    },
  ],
  invalid: [
    {
      code: stripIndent`
        // not composed component
        import { Component, OnDestroy, OnInit } from "@angular/core";
        import { of, Subscription } from "rxjs";

        @Component({
          selector: "not-composed-component",
          template: "<span>{{ value }}</span>"
        })
        export class NotComposedComponent implements OnInit, OnDestroy {
          value: string;
          ngOnInit() {
            of("foo").subscribe(value => this.value = value);
            const subscription = of("bar").subscribe(value => this.value = value);
          }
          ngOnDestroy() {
          }
        }
      `,
      errors: [
        {
          messageId: "forbidden",
          line: 12,
          column: 15,
          endLine: 12,
          endColumn: 24,
        },
        {
          messageId: "forbidden",
          line: 13,
          column: 39,
          endLine: 13,
          endColumn: 48,
        },
      ],
    },
    {
      code: stripIndent`
        // not unsubscribed component
        import { Component, OnDestroy, OnInit } from "@angular/core";
        import { of, Subscription } from "rxjs";

        @Component({
          selector: "not-unsubscribed-component",
          template: "<span>{{ value }}</span>"
        })
        export class NotUnsubscribedComponent implements OnInit, OnDestroy {
          value: string;
          private subscription = new Subscription();
          ngOnInit() {
            this.subscription.add(of("foo").subscribe(value => this.value = value));
          }
          ngOnDestroy() {
          }
        }
      `,
      errors: [
        {
          messageId: "forbidden",
          line: 11,
          column: 11,
          endLine: 11,
          endColumn: 23,
        },
      ],
    },
    {
      code: stripIndent`
        // not destroyed component
        import { Component, OnDestroy, OnInit } from "@angular/core";
        import { of, Subscription } from "rxjs";

        @Component({
          selector: "not-destroyed-component",
          template: "<span>{{ value }}</span>"
        })
        export class NotDestroyedComponent implements OnInit {
          value: string;
          private subscription = new Subscription();
          ngOnInit() {
            this.subscription.add(of("foo").subscribe(value => this.value = value));
          }
        }
      `,
      errors: [
        {
          messageId: "forbidden",
          line: 9,
          column: 14,
          endLine: 9,
          endColumn: 35,
        },
      ],
    },
  ],
});
