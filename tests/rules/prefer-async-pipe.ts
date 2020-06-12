/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/eslint-plugin-rxjs-angular
 */

import { stripIndent } from "common-tags";
import { fromFixture } from "eslint-etc";
import rule = require("../../source/rules/prefer-async-pipe");
import { ruleTester } from "../utils";

ruleTester({ types: true }).run("prefer-async-pipe", rule, {
  valid: [
    stripIndent`
      // async pipe
      import { of } from "rxjs";
      @Component({
        selector: "some-component",
        template: "<span>{{ something | async }}</span>"
      })
      class SomeComponent {
        something = of("foo");
      }
    `,
  ],
  invalid: [
    fromFixture(
      stripIndent`
        // subscribe
        import { of } from "rxjs";
        @Component({
          selector: "some-component",
          template: "<span>{{ something }}</span>"
        })
        class SomeComponent implements OnInit {
          something: string;
          ngOnInit() {
            of("foo").subscribe(value => this.something = value);
                      ~~~~~~~~~ [forbidden]
          }
        }
      `
    ),
  ],
});
