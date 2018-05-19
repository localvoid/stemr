# [stemr](https://github.com/localvoid/stemr) &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/localvoid/stemr/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/stemr.svg)](https://www.npmjs.com/package/stemr) [![codecov](https://codecov.io/gh/localvoid/stemr/branch/master/graph/badge.svg)](https://codecov.io/gh/localvoid/stemr) [![CircleCI Status](https://circleci.com/gh/localvoid/stemr.svg?style=shield&circle-token=:circle-token)](https://circleci.com/gh/localvoid/stemr) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/localvoid/stemr)

`stemr` package provides a javascript (TypeScript) implementation of the [Snowball](http://snowball.tartarus.org/)
English (porter2) stemmer algorithm.

## Example

```ts
import { stem } from "stemr";

stem("stemming");
// => "stem"
```
