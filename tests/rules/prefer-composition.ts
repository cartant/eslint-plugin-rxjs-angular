/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-rxjs-angular
 */

import { stripIndent } from "common-tags";
import { fromFixture } from "eslint-etc";
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
    fromFixture(
      stripIndent`
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
                      ~~~~~~~~~ [notComposed]
            const subscription = of("bar").subscribe(value => this.value = value);
                                           ~~~~~~~~~ [notComposed]
          }
          ngOnDestroy() {
          }
        }
      `
    ),
    fromFixture(
      stripIndent`
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
                  ~~~~~~~~~~~~ [notUnsubscribed]
          ngOnInit() {
            this.subscription.add(of("foo").subscribe(value => this.value = value));
          }
          ngOnDestroy() {
          }
        }
      `
    ),
    fromFixture(
      stripIndent`
        // not destroyed component
        import { Component, OnDestroy, OnInit } from "@angular/core";
        import { of, Subscription } from "rxjs";

        @Component({
          selector: "not-destroyed-component",
          template: "<span>{{ value }}</span>"
        })
        export class NotDestroyedComponent implements OnInit {
                     ~~~~~~~~~~~~~~~~~~~~~ [notImplemented]
          value: string;
          private subscription = new Subscription();
          ngOnInit() {
            this.subscription.add(of("foo").subscribe(value => this.value = value));
          }
        }
      `
    ),
    fromFixture(
      stripIndent`
        // not declared
        import { Component, OnDestroy, OnInit } from "@angular/core";
        import { of, Subscription } from "rxjs";

        @Component({
          selector: "not-declared-component",
          template: "<span>{{ value }}</span>"
        })
        export class NotDeclaredComponent implements OnInit {
                     ~~~~~~~~~~~~~~~~~~~~ [notDeclared { "name": "subscription" }]
          value: string;
          ngOnInit() {
            const subscription = new Subscription();
            subscription.add(of("foo").subscribe(value => this.value = value));
          }
          ngOnDestroy() {
          }
        }
      `
    ),
  ],
});
