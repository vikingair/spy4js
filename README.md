[![GitHub license][license-image]][license-url]
[![npm package][npm-image]][npm-url] 
[![Travis][build-image]][build-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![styled with prettier][prettier-image]][prettier-url]

# ![spy4js logo](spy-logo.svg?sanitize=true) spy4js

### Benefits

  - `TypeScript` support included
  - `flow` support included
  - Performance
  - No foreign dependencies
  - Optimized error messages
  - Customizable
  - Intuitive
  - Used in production of large projects

### Introduction

**spy4js** provides a stand-alone spy framework. It is decoupled by any dependencies
and other assertion frameworks.

**spy4js** exports only one object called `Spy`. The spy instances
are treated as class instances and come with a lot of useful features. See below for more.

**Hint**:
My favorite test framework is [Jest](https://jestjs.io/). If you are using other
frameworks you might get issues related to automatically applied test suite hooks.
To overcome this default behaviour see [here](#configure-static).

### Installation
##### With yarn
```
yarn add --dev spy4js
```
##### With npm
```
npm install --save-dev spy4js
```

### Interface

A spy instance can be initialized differently.

```js
import { Spy } from 'spy4js';

// initialize directly
const spy1 = new Spy();

// initialize directly and supply an identifier for debugging purpose (default: 'the spy')
const spy2 = new Spy('special spy for me');

// initialize by mocking another objects attribute (usually this attribute is a function)
const someObject1 = new Date(2017, 1, 15);
const spy3 = Spy.on(someObject1, 'toJSON');
// (spy name will be accordingly: "the spy on 'toJSON'")

// initialize many by mocking another objects attributes
const someObject2 = new Date(2017, 1, 15);
const someObject2$Mock = Spy.mock(someObject2, 'toJSON', 'toString', 'getDate');

// mock exported functions from other modules
const myModuleMocks = Spy.mockModule('./my-module', 'useMe');

// mock React components from other modules
const { Calculator } = Spy.mockModule('./my/fancy/Calculator', 'Calculator');
```

Any spy instance can be configured by overriding the default configuration. For
example if you want to configure all spies not to favor own "equals" implementations.
```js
Spy.configure({useOwnEquals: false});
```

You may apply additional behaviour to every spy. The valid operations here are:
    
  - `configure` (some external libraries may use own "equals" implementations in an unexpected way)
  - `calls` (does make the spy call the provided functions sequentially)
  - `returns` (does make the spy return the provided params sequentially)
  - `throws` (does make the spy throw an error when called)
  - `transparent` (does make the spy call the original method of a mocked object)
  - `transparentAfter` (does make the spy call the original method of a mocked object after a certain amount of made calls)
  - `reset` (resets the registered calls which were already made)
  - `restore` (does make the spy restore the mocked object)
    
All those methods on a spy are designed in a builder pattern. So you may chain any of
these configurations. But be aware that some behaviours override existing behaviours.

```js
const spy = Spy.on(someObject, 'someMethod');

// configure it to use NOT own "equals" implementations
spy.configure({useOwnEquals: false});

// make it call any functions
spy.calls(func1, func2, func3);
someObject.someMethod(arg); // returns func1(arg)
someObject.someMethod(arg1, arg2); // returns func2(arg1, arg2)
someObject.someMethod(arg); // returns func3(arg)
someObject.someMethod(arg1, arg2, arg3); // returns func3(arg1, arg2, arg3) // sticks to the last

// make it return any values
spy.returns(value1, value2);
someObject.someMethod(arg); // returns value1
someObject.someMethod(arg1, arg2); // returns value2
someObject.someMethod(arg); // returns value2 // sticks to the last

// make it throw any message (the message is optional)
spy.throws('throw this');
someObject.someMethod(arg); // throws new Error('throw this')

// make it return always the current date and transparentAfter 2 calls
spy.calls(() => new Date()).transparentAfter(2);
someObject.someMethod(arg); // returns new Date()
someObject.someMethod(arg1, arg2); // returns new(er) Date()
someObject.someMethod(arg); // returns someObject.someMethod(arg) // sticks to this behaviour

// make it immediatly transparent
spy.transparent();

// make it reset
spy.reset();

// make it restore
spy.restore(); // other than "transparent" does not control input and output of the mocked function anymore
```

Even as important are the facts, we want to display:

  - `wasCalled` (does display that the spy was called a specifiable amount of times)
  - `wasNotCalled` (does display that the spy was never called)
  - `wasCalledWith` (does display that the spy was called at least once like with the provided params)
  - `wasNotCalledWith` (does display that the spy was never like with the provided params)
  - `hasCallHistory` (does display that the spy was called with the following params in the given order)

Those methods on a spy display facts. Facts have to be true, otherwise they
will throw an Exception, which displays in a formatted debug message why the
given fact was a lie. By writing those facts in your tests, a big refactoring
loses its scare.

```js
const spy = new Spy();

spy.wasNotCalled();

// in fact: you never want to call a spy directly for any purpose
// -> therefore using flow this line would complain
spy([1, 'test', {attr: [4]}]);

spy.wasCalled();  // called at least once
spy.wasCalled(1); // called exactly once

spy('with this text');

spy.wasCalled(2); // called exactly 2 times

// the spy was called at least once with equal params
spy.wasCalledWith([1, 'test', {attr: [4]}]);

// the spy was not called with those params
spy.wasNotCalledWith([1, 'test', {attr: [3]}]);

// the spy was called twice with the following params and in same order
spy.hasCallHistory([ [1, 'test', {attr: [4]}] ], 'with this text');
```

There is one static method that does restore all existing spies in all tests.
This is extremely useful to clean up all still existing mocks and also
a very comfortable to this automatically after every test (this is done by default).
    
  - `restoreAll` (does restore every existing spy)

```js
Spy.restoreAll();
```

And also sometimes it is necessary to have access to some of the call arguments with
which the spy was called.

  - `getAllCallArguments` (returns all call arguments for all calls in an array containing arrays)
  - `getCallArguments` (returns all call arguments for a specified call in an array)
  - `getCallArgument` (same as getCallArguments, but returns only a single element of the array)
  - `getCallCount` (returns the number of made calls)
    
```js
const spy = new Spy();

// make some calls
spy('string', 1);
spy([1, 2, 3]);
spy();
spy(null);

spy.getAllCallArguments();     // returns [['string', 1], [[1, 2, 3]], [], [null]]
spy.getCallCount();     // returns 4
spy.getCallArguments(/* default = 0 */);     // returns ['string', 1]
spy.getCallArgument(/* defaults = (0, 0) */); // returns 'string'
spy.getCallArgument(0, 1); // returns 1

spy.getCallArguments(1);                     // returns [[1, 2, 3]]
spy.getCallArgument(1);                 // returns [1, 2, 3]

spy.getCallArguments(2);                     // returns []
spy.getCallArgument(2);                 // returns undefined

spy.getCallArguments(3);                     // returns [null]
spy.getCallArgument(3);                 // returns null

spy.getCallArguments(4);                     // throws Exception because less calls were made
spy.getCallArgument(4);                 // throws same Exception
```

The last method is `showCallArguments`. It is mostly used internally to improve the
debug messages, but can be while you are in a console.log-mania.

## Method-Details

### Constructor
```
Spy(spyName:string = 'the spy') => SpyInstance
```
The returned Spy instance has his own name-attribute (only) for debugging purpose.

### configure (static)
```
Spy.configure(config: {
    useOwnEquals?:boolean,
    beforeEach?: (scope: string) => void,
    afterEach?: (scope: string) => void,
}) => void
```
Using this function you may edit the default behaviour spy4js itself.
The scope param will contain the test-suite name, which was provided as first parameter
of the `describe` function.
The configuration possibility are:
- **useOwnEquals**: Applies for all spy instances. See [configure](#configure) for more details.
- **beforeEach**: Let's you override the default beforeEach test suite hook.
- **afterEach**: Let's you override the default afterEach test suite hook.

### on (static)
```
Spy.on(object:Object, methodName:string) => SpyInstance
```
Initializing a spy on an object, simply replaces the original function by a spy and 
stores the necessary information to be able to restore the mocked method. 

If the attribute was already spied or is not a function, the Spy will throw an exception
to avoid unexpected behaviour. You never want to spy other attributes than functions and
for no purpose a spy should ever be spied.

### mock (static)
```
Spy.mock(object:Object, ...methodNames: string[]) => Object (Mock)
```
Creating an object that references spies for all given methodNames.
Initialize as many spies as required for one and the same object. Only
after `Spy.initMocks` gets called, the created mock does affect the given object.

### mockModule (static)
```
Spy.mockModule(moduleName: string, ...methodNames: string[]) => Object (Mock)
```
Same as [mock](#mock) but only necessary if you want to mock exported functions.

### mockReactComponents (static)
```
Spy.mockReactComponents(moduleName: string, ...methodNames: string[]) => Object (Mock)
```
Same as [mockModule](#mockModule) but designed for ReactJS components. The registered
spies return `null` instead of `undefined`. This makes minimal usable React components.
Even if in most cases the pure mocking is nice enough, you can even test the number
of rerender cycles and the provided props of the mocked component. Works perfectly
with [enzyme](https://www.npmjs.com/package/enzyme) and
[@testing-library/react](https://testing-library.com/docs/react-testing-library/intro).

### initMocks (static)
```
Spy.initMocks(scope?: string) => void
```
Does initialize all global and scope-related mocks by applying spies. Mocks can be
created with [mock](#mock) or [mockModule](#mockModule). This function has not to 
be called manually, if you rely on the default test suite hooks.

### restoreAll (static)
```
Spy.restoreAll() => void
```
Does restore all mocked objects to their original state. See [restore](#restore) for
further information. This function has not be called manually, if you rely on
the default test suite hooks.

### resetAll (static)
```
Spy.resetAll() => void
```
Does reset all existing spies. This effects even persistent spies.
See [reset](#reset) for further information. This function has not be
called manually in between different tests, if you rely on the default
test suite hooks.

### IGNORE (static)
```
Spy.IGNORE = $Internal Symbol$
```
This object can be passed anywhere where you want the "[wasCalledWith](#wasCalledWith)"
or "[hasCallHistory](#hasCallHistory)" to ignore that object or value for comparison.
```js
spy({prop: 'value', other: 13}, 12);

spy.wasCalledWith(Spy.IGNORE, 12);
spy.wasCalledWith({prop: Spy.IGNORE, other: 13}, 12);
```

### COMPARE (static)
```
Spy.COMPARE(comparator: (arg: any) => boolean | void) => SpyComparator
```
This function can be called with a custom comparator and passed anywhere where you want the "[wasCalledWith](#wasCalledWith)"
or "[hasCallHistory](#hasCallHistory)" to apply your custom comparison. Very useful if
the spy gets called with functions that you want to test additionally.
```js
spy(() => ({ prop: 'value', other: 13 }), 12);

spy.wasCalledWith(Spy.COMPARE(fn => fn().prop === 'value'), 12);
spy.wasCalledWith(Spy.COMPARE(fn => {
    expect(fn()).toEqual({ prop: 'value', other: 13 });
}), 12);
```

### MAPPER (static)
```
Spy.MAPPER(from: any | any[], to: any) => SpyComparator
```
This function can be called in the same places like `Spy.COMPARE`. It is not that much
customizable but provides a nice way to evaluate mapper functions. Meaning pure 
functions that return some output for given inputs. The function will be called exactly
once for each comparison, so you can even rely on site effects you might want to test,
if you want to use this for non-pure functions.
```js
spy((value: number) => ({ prop: 'here', other: value }), 12);
spy((value: number, num: number) => ({ prop: 'here', value, num }), 12);

spy.wasCalledWith(Spy.MAPPER('foo', { prop: 'here', other: 'foo' }), 12);
spy.wasCalledWith(Spy.MAPPER(['foo', 44], { prop: 'here', value: 'foo', num: 44 }), 12);
```


### configure
```
spy.configure(config: { useOwnEquals?: boolean, persistent?: boolean }) => (this) SpyInstance
```
With `configure` the spy can be configured. One configuration possibility
is to ignore any `equals` methods while comparing objects. There might be libraries which
come with those methods, but do not support ES6 classes or anything else. By default this
configuration is set to favor own `equals` implementations while comparing objects. 

Another possible configuration is to make the spy persist while other spies have to restore
when ["restoreAll"](#restoreall) was called. This spy can ONLY RESTORE the mocked object when
you configure it back to be NOT PERSISTENT. This configuration can only be applied to mocking
spies. For Spies created with `new Spy()` this configuration will throw an exception.

### calls
```
spy.calls(...functions:Array<Function>) => (this) SpyInstance
```
The provided functions will be called sequentially in order when the spy will be called.
Meaning `spy.calls(func1, func2, func3)` will call first `func1` then `func2` and the rest
of the time `func3`.

### returns
```
spy.returns(...args: Array<any>) => (this) SpyInstance
```
The provided arguments will be returned sequentially in order when the spy will be called.
Meaning `spy.returns(arg1, arg2, arg3)` will return first `arg1` then `arg2` and the rest
of the time `arg3`.

### resolves
```
spy.resolves(...args: Array<any>) => (this) SpyInstance
```
The provided arguments will be resolved sequentially in order when the spy will be called.
Meaning `spy.resolves(arg1, arg2, arg3)` will return first `Promise.resolve(arg1)` then `Promise.resolve(arg2)` and the rest
of the time `Promise.resolve(arg3)`.


### rejects
```
spy.rejects(...args: Array<?string | Error>) => (this) SpyInstance
```
The provided arguments will be rejected sequentially in order when the spy will be called.
Meaning `spy.rejects('foo', null, new Error('bar'))` will return first `Promise.reject(new Error('foo'))`
then `Promise.reject(new Error('<SPY_NAME> was requested to throw'))` and the rest
of the time `Promise.reject(new Error('bar'))`.

### throws
```
spy.throws(message: ?string | Error) => (this) SpyInstance
```
Perform this on a spy to make it throw an error when called. The error message can be
provided but a default is also implemented. If an Error instance gets passed, exactly this one will
be thrown.

### reset
```
spy.reset() => (this) SpyInstance
```
Does reset the registered calls on that spy.

### restore
```
spy.restore() => (this) SpyInstance
```
Restores the spied object, if existing, to its original state. The spy won't lose any
other information. So it is still aware of made calls, can be plugged anywhere else
and can still be called anywhere else. But it loses all references to the spied object.

If the spy was configured to be persistent this method will throw an error.

### transparent
```
spy.transparent() => (this) SpyInstance
```
Can be useful with spies on objects. It does make the spy behave like not existing. So
the original function of the "mocked" object will be called, but the spy does remember
the call information.

### transparentAfter
```
spy.transparentAfter(callCount:number) => (this) SpyInstance
```
Works like [transparent](#transparent) but the spy will get transparent after called as
often as specified. Meaning `spy.transparentAfter(num)` will not be transparent on the first
`num` calls.

### wasCalled
```
spy.wasCalled(callCount: number = 0) => (fact) void
```
This call does display a fact. So if the spy is violating the fact, it is told to throw
an error. The provided argument does represent the registered calls on that spy.

### wasNotCalled
```
spy.wasNotCalled() => (fact) void
```
This fact displays that the spy was never called. Directly after the spy was [reset](#reset)ed,
this fact will be given.

### wasCalledWith
```
spy.wasCalledWith(...args: Array<any>) => (fact) void
```
This fact displays that the spy was called at least once with equal arguments. 

The equality check is a deep equality check, which (by default) does consider
own "equals" implementations.

By supplying `Spy.IGNORE` anywhere inside the expected call arguments, you
can avoid that the comparison is further executed. See [Spy.IGNORE](#IGNORE) for further information and examples.

The deep equality check does also recursively iterate to the first difference found and is able
to return a string which contains valuable information about the first found difference. 

If any difference was detected. The fact is broken and a helpful error message will be displayed.
If using monospaced consoles for the output which do support new lines, there will be really
neat output. For examples see [showCallArguments](#showcallarguments)

### wasNotCalledWith
```
spy.wasNotCalledWith(...args: Array<any>) => (fact) void
```
This fact displays simply the opposite of [wasCalledWith](#wascalledwith).

### hasCallHistory
```
spy.hasCallHistory(...callHistory: Array<Array<any> | any>) => (fact) void
```
Works similar to [wasCalledWith](#wascalledwith) but instead matches each
call one by one in **correct order** and **correct call count**.
ATTENTION: single argument calls can be provided without wrapping into an array. But e.g. if
the single argument is an array itself, than you have to warp it also yourself. (Inspired by jest
data providers)

### getAllCallArguments
```
spy.getAllCallArguments() => Array<any[]>
```
Returns the call arguments of all made calls to the spy.
Especially returning an empty array if the spy was never called.

### getCallArguments
```
spy.getCallArguments(callNr: number = 0) => Array<any>
```
Returns the call arguments that were registered on the given call. Meaning
`spy.getCallArguments(num)` does return the (num + 1)'th call arguments.

Throws an exception if the provided (`callNr` - 1) is bigger than the made calls.

### getCallArgument
```
spy.getCallArgument(callNr: number = 0, argNr: number = 0) => any
```
Same as [getCallArguments](#getcallarguments) but returns only a single entry out
of the array of arguments. Most useful in situations where exactly one call param is expected.
If `argNr` is given, it returns the (argNr + 1)'th argument of the call.

### getCallCount
```
spy.getCallCount() => number
```
This method simply returns the number of made calls on the spy.

### showCallArguments
```
spy.showCallArguments(additionalInformation: Array<string> = []) => string
```
This primarily internally used method is responsible for returning formatted informative debug
messages when facts are broken. Let's do an example:
```js
const spy = new Spy('my awesome spy');
spy(42, 'test', { attr1: [1, 2, new Date(2017, 1, 20)], attr2: 1337 });
spy(42, 'test', { attr1: [0, 2, new Date(2017, 1, 20)], attr2: 1336 });
spy(42, 'test', { attr1: [1, 2, new Date(2017, 1, 21)], attr2: 1336 });
spy(42, 'tes', { attr1: [1, 2, new Date(2017, 1, 20)], attr2: 1336 });
spy(42, 'test');
```
The following broken fact...
```js
spy.wasCalledWith(42, 'test', {attr1: [1, 2, new Date(2017, 1, 20)], attr2: 1336});
```
...would produce the following error output:
```
Error: 

my awesome spy was considered to be called with the following arguments:

    --> [42, 'test', {attr1: [1, 2, new Date(1487545200000)], attr2: 1336}]

Actually there were:

call 0: [42, 'test', {attr1: [1, 2, new Date(1487545200000)], attr2: 1337}]
        --> 2 / attr2 / different number [1337 != 1336]
call 1: [42, 'test', {attr1: [0, 2, new Date(1487545200000)], attr2: 1336}]
        --> 2 / attr1 / 0 / different number [0 != 1]
call 2: [42, 'test', {attr1: [1, 2, new Date(1487631600000)], attr2: 1336}]
        --> 2 / attr1 / 2 / different date [new Date(1487631600000) != new Date(1487545200000)]
call 3: [42, 'tes', {attr1: [1, 2, new Date(1487545200000)], attr2: 1336}]
        --> 1 / different string ['tes' != 'test']
call 4: [42, 'test']
        --> 2 / one was undefined [undefined != {attr1: [1, 2, new Date(1487545200000)], attr2: 1336}]
```
There you can see that the arguments of the fact (displayed above all others) does not
match any of the call arguments on the 5 made calls. 

For each call we display additional error information (the first found difference).
If the additional information begins with a `-->` there was made a deep equality.
If you would travers with the displayed keys you would be directed to those objects which differ.

In this example the arguments differ for `call 0` in `-->` the third argument (`2`) and
its attribute `attr2` because there was a different number.

While recursively traversing down in the deep equality check, the object keys will be reported.
Meaning that `2` is representing the index of the array. So for example if you want to grep the
different objects you could:
```js
const callArgs = spy.getCallArguments(0/* for the 0'th call above*/);
const differentNumber = callArgs[2]['attr2'];
```
  
[license-image]: https://img.shields.io/badge/license-MIT-blue.svg
[license-url]: https://github.com/fdc-viktor-luft/form4react/blob/master/LICENSE
[build-image]: https://img.shields.io/travis/fdc-viktor-luft/spy4js/master.svg?style=flat-square
[build-url]: https://travis-ci.org/fdc-viktor-luft/spy4js
[npm-image]: https://img.shields.io/npm/v/spy4js.svg?style=flat-square
[npm-url]: https://www.npmjs.org/package/spy4js
[coveralls-image]: https://coveralls.io/repos/github/fdc-viktor-luft/spy4js/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/fdc-viktor-luft/spy4js?branch=master
[prettier-image]: https://img.shields.io/badge/styled_with-prettier-ff69b4.svg
[prettier-url]: https://github.com/prettier/prettier
