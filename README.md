 
# spy4js [![npm package][npm-badge]][npm]

[npm-badge]: https://img.shields.io/npm/v/spy4js.svg?style=flat-square
[npm]: https://www.npmjs.org/package/spy4js

### Benefits

  - Well tested
  - Used in production of large projects
  - Flow support (therefore autocompletion in some IDEs)
  - Without dependecies nor boilerplate
  - Helpful Debug-Messages
  - Supports own "equals" implementation on objects
  - A lot of useful operations on spys

### Introduction

**spy4js** provides a stand-alone spy framework. It is decoupled by any dependencies and other assertion frameworks. Other than most test frameworks it uses a different - maybe you will need to get used to - test notation. It does not make assertion, which are expected to be fulfilled on runtime, but displays facts, that are considered to be fulfilled on runtime. And if this fact is not true, it will throw an exception. I consider the way of writing facts more regular because it fits more to the rest of the written code.

**spy4js** comes with the one interesting (es6 like) class `Spy`. The spy instances are treated as class instances and come with a lot of useful features. See below for more.

### Installation

Like every other npm package. You may `npm install spy4js --save-dev` to save the latest version to your dev dependencies.

### Interface

A spy instance can be initialized differently.

```js
import {Spy} from 'spy4js';

// initialize directly
const spy1 = new Spy();

// initialize directly and supply an identifier for debugging purpose (default: 'the spy')
const spy2 = new Spy('special spy for me');

// initialize by mocking another objects attribute (usually this attribute is a function)
const someObject = new Date(2017, 1, 15);
const spy3 = Spy.on(someObject, 'toJSON');
// (spy name will be accordingly: 'the spy on \'toJSON\'')

// initialize many by mocking another objects attributes
const someObject = new Date(2017, 1, 15);
const [spy4, spy5, spy6] = Spy.onMany(someObject, 'toJSON', 'toString', 'getDate');
```

You may apply additional behaviour to every spy. The valid operations here are:
    
  - `configure` (some external librarys may use own "equals" implementations in an unexpected way)
  - `calls` (does make the spy call the provided functions sequentially)
  - `returns` (does make the spy return the provided params sequentially)
  - `throws` (does make the spy throw an error when called)
  - `transparent` (does make the spy call the original method of a mocked object)
  - `transparentAfter` (does make the spy call the original method of a mocked object after a certain amount of made calls)
  - `reset` (resets the registered calls which were already made)
  - `restore` (does make the spy restore the mocked object)
    
All those methods on a spy are designed in a builder pattern. So you may chain any of these configurations. But be aware that some behaviours override existing behaviours.

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

Those methods on a spy display facts. Facts have to be true, otherwise they will throw an Exception, which displays in a formatted debug message why the given fact was a lie. By writing those facts in your tests, a big refactoring loses its scare.

```js
const spy = new Spy();

spy.wasNotCalled();

// in fact: you never want to call a spy directly for any purpose (therefore using flow this will complain)
spy([1, 'test', {attr: [4]}]);

spy.wasCalled(); // called at least once
spy.wasCalled(1); // called exctly once

spy('with this text');

spy.wasCalled(2); // called extactly 2 times

spy.wasCalledWith([1, 'test', {attr: [4]}]); // the spy was called at least once with equal params

spy.wasNotCalledWith([1, 'test', {attr: [3]}]); // the spy was not called with those params (do you see the difference?)
```

There is one static method that does restore all existing spies in all tests. This is extremly useful to clean up all still existing mocks and also a very comfortable to this automaticly after every test (like in an "afterEach").
    
  - `restoreAll` (does restore every existing spy)

```js
Spy.restoreAll();
```

And also sometimes it is necessary to have access to some of the call arguments with which the spy was called.

  - `getCallArguments` (returns all call arguments for a specified call in an array)
  - `getFirstCallArgument` (same as getCallArguments, but returns only the first element of the array)
    
```js
const spy = new Spy();

// make some calls
spy('string', 1);
spy([1, 2, 3]);
spy();
spy(null);

spy.getCallArguments(/* default = 0 */); // returns ['string', 1]
spy.getFirstCallArgument(/* default = 0 */); // returns 'string'

spy.getCallArguments(1); // returns [[1, 2, 3]]
spy.getFirstCallArgument(1); // returns [1, 2, 3]

spy.getCallArguments(2); // returns []
spy.getFirstCallArgument(2); // returns undefined

spy.getCallArguments(3); // returns [null]
spy.getFirstCallArgument(3); // returns null

spy.getCallArguments(4); // throws Exception because less calls were made
spy.getFirstCallArgument(4); // throws same Exception
```

The last method is `showCallArguments`. It is mostly used internally to improve the debug messages, but can be while you are in a console.log-mania.

## Method-Details (TODO)