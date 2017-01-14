/*
 * This is an interface for flow. It declares types for all globals that are used
 *
 * @flow
 */

declare function __(text: string) : string;

// mocha
declare function describe(name: string, cb: () => void) : void;
declare function it(name: string, cb: (done: ()=> void) => void) : void;
declare function after(cb: () => void) : void;
declare function before(cb: () => void) : void;
declare function afterEach(cb: () => void) : void;
declare function beforeEach(cb: () => void) : void;
