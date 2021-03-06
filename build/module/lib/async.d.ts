/**
 * A sample async function (to demo Typescript's es7 async/await downleveling).
 *
 * ### Example (es imports)
 * ```js
 * import { asyncABC } from 'typescript-starter'
 * console.log(await asyncABC())
 * // => ['a','b','c']
 * ```
 *
 * ### Example (commonjs)
 * ```js
 * var double = require('typescript-starter').asyncABC;
 * asyncABC().then(console.log);
 * // => ['a','b','c']
 * ```
 *
 * @returns       a Promise which should contain `['a','b','c']`
 */
export declare function asyncABC(): Promise<ReadonlyArray<string>>;
