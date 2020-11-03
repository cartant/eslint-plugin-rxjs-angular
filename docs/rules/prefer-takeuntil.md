# Use `takeUntil` and  `ngOnDestroy` (`prefer-takeuntil`)

This rule effects failures if `subscribe` is called within a component and the `takeUntil`-destroyed pattern is not used.

## Rule details

Examples of **incorrect** code for this rule:

```ts
import { Component, OnInit } from "@angular/core";
import { switchMap } from "rxjs/operators";

@Component({
  selector: "some-component"
})
class SomeComponent implements OnInit {
  // ...
  ngOnInit() {
    this.values.pipe(
      switchMap((value) => something(value))
    ).subscribe();
  }
}
```

Examples of **correct** code for this rule:

```ts
import { Component, OnDestroy, OnInit } from "@angular/core";
import { switchMap } from "rxjs/operators";

@Component({
  selector: "some-component"
})
class SomeComponent implements OnDestroy, OnInit {
  private destroy = new Subject<void>();
  // ...
  ngOnInit() {
    this.values.pipe(
      switchMap((value) => something(value)),
      takeUntil(this.destroy)
    ).subscribe();
  }
  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }
}
```

## Options

This rule accepts a single option which is an object with `checkComplete`, `checkDecorators`, `checkDestroy` and `alias` properties.

The `checkComplete` property is a boolean that determines whether or not `complete` must be called after `next` and the `checkDestroy` property is a boolean that determines whether or not a `Subject`-based `ngOnDestroy` must be implemented.

The `checkDecorators` property is an array containing the names of the decorators that determine whether or not a class is checked. By default, `checkDecorators` is `["Component"]`.

The `alias` property is an array of names of operators that should be treated similarly to `takeUntil`.

```json
{
  "rxjs-angular/prefer-takeuntil": [
    "error",
    {
      "alias": ["untilDestroyed"],
      "checkComplete": true,
      "checkDecorators": ["Component"],
      "checkDestroy": true
    }
  ]
}
```

## Further reading

- [Avoiding takeUntil leaks](https://ncjamieson.com/avoiding-takeuntil-leaks/)