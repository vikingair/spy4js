 
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

**spy4js** provides a stand-alone spy framework. It is decoupled by any dependencies
and other assertion frameworks. Other than most test frameworks it uses a different -
maybe you will need to get used to - test notation. It does not make assertion,
which are expected to be fulfilled on runtime, but displays facts, that are
considered to be fulfilled on runtime. And if this fact is not true, it will
throw an exception. I consider the way of writing facts more regular because it
fits more to the rest of the written code.

**spy4js** comes with the one interesting (es6 like) class `Spy`. The spy instances
are treated as class instances and come with a lot of useful features. See below for more.

### Installation

Like every other npm package. You may `npm install spy4js --save-dev` to save the
latest version to your dev dependencies.

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

spy.wasCalledWith([1, 'test', {attr: [4]}]);    // the spy was called at least once with equal params

spy.wasNotCalledWith([1, 'test', {attr: [3]}]); // the spy was not called with those params
```

There is one static method that does restore all existing spies in all tests.
This is extremly useful to clean up all still existing mocks and also
a very comfortable to this automaticly after every test (like in an "afterEach").
    
  - `restoreAll` (does restore every existing spy)

```js
Spy.restoreAll();
```

And also sometimes it is necessary to have access to some of the call arguments with
which the spy was called.

  - `getCallArguments` (returns all call arguments for a specified call in an array)
  - `getFirstCallArgument` (same as getCallArguments, but returns only the first element of the array)
  - `getCallCount` (returns the number of made calls)
    
```js
const spy = new Spy();

// make some calls
spy('string', 1);
spy([1, 2, 3]);
spy();
spy(null);

spy.getCallArguments(/* default = 0 */);     // returns ['string', 1]
spy.getFirstCallArgument(/* default = 0 */); // returns 'string'

spy.getCallArguments(1);                     // returns [[1, 2, 3]]
spy.getFirstCallArgument(1);                 // returns [1, 2, 3]

spy.getCallArguments(2);                     // returns []
spy.getFirstCallArgument(2);                 // returns undefined

spy.getCallArguments(3);                     // returns [null]
spy.getFirstCallArgument(3);                 // returns null

spy.getCallArguments(4);                     // throws Exception because less calls were made
spy.getFirstCallArgument(4);                 // throws same Exception
```

The last method is `showCallArguments`. It is mostly used internally to improve the
debug messages, but can be while you are in a console.log-mania.

## Method-Details

### Constructor
```
Spy(spyName:string = 'the spy') => Spy
```
The returned Spy instance has his own name-attribute (only) for debugging purpose.

### on (static)
```
Spy.on(object:Object, methodName:string) => Spy
```
Initializing a spy on an object, simply replaces the original function by a spy and 
stores the necessary information to be able to restore the mocked method. 

If the attribute was already spied or is not a function, the Spy will throw an exception
to avoid unexpected behaviour. You never want to spy other attributes than functions and
for no purpose a spy should ever be spied.

### onMany (static)
```
Spy.onMany(object:Object, ...methodNames:Array<string>) => Array<Spy>
```
Initializing as many spies as required for one and the same object. Same as calling
`Spy.on` for each method name.

### restoreAll (static)
```
Spy.restoreAll() => Array<Spy>
```
Does restore all mocked objects to their original state. See [restore](#restore) for
further information.

### configure
```
spy.configure(config:{useOwnEquals?: boolean, persistent?: boolean}) => (this) Spy
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
spy.calls(...functions:Array<Function>) => (this) Spy
```
The provided functions will be called sequentially in order when the spy will be called.
Meaning `spy.calls(func1, func2, func3)` will call first `func1` then `func2` and the rest
of the time `func3`.

### returns
```
spy.returns(...args:Array<any>) => (this) Spy
```
The provided arguments will be returned sequentially in order when the spy will be called.
Meaning `spy.returns(arg1, arg2, arg3)` will return first `arg1` then `arg2` and the rest
of the time `arg3`.

### throws
```
spy.throws(message:?string) => (this) Spy
```
Perform this on a spy to make it throw an error when called. The error message can be
provided but a default is also implemented.

### reset
```
spy.reset() => (this) Spy
```
Does reset the registered calls on that spy.

### restore
```
spy.restore() => (this) Spy
```
Restores the spied object, if existing, to its original state. The spy won't lose any
other information. So it is still aware of made calls, can be plugged anywhere else
and can still be called anywhere else. But it loses all references to the spied object.

If the spy was configured to be persistent this method will throw an error.

### transparent
```
spy.transparent() => (this) Spy
```
Can be useful with spies on objects. It does make the spy behave like not existing. So
the original function of the "mocked" object will be called, but the spy does remember
the call information.

### transparentAfter
```
spy.transparentAfter(callCount:number) => (this) Spy
```
Works like [transparent](#transparent) but the spy will get transparent after called as
often as specified. Meaning `spy.transparentAfter(num)` will not be transparent on the first
`num` calls.

### wasCalled
```
spy.wasCalled(callCount:number = 0) => (fact) void
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
spy.wasCalledWith(...args:Array<any>) => (fact) void
```
This fact displays that the spy was called at least once with equal arguments. 

The equality check is a deep equality check, which (by default) does consider
own "equals" implementations.

The deep equality check does also recursively iterate to the first difference found and is able
to return a string which contains valuable information about the first found difference. 

If any difference was detected. The fact is broken and a helpful error message will be displayed.
If using monospaced consoles for the output which do support new lines, there will be really
neat output. For examples see [showCallArguments](#showcallarguments)

### wasNotCalledWith
```
spy.wasNotCalledWith(...args:Array<any>) => (fact) void
```
This fact displays simply the opposite of [wasCalledWith](#wascalledwith).

### getCallArguments
```
spy.getCallArguments(callNr:number = 0) => Array<any>
```
Returns the call arguments that were registered on the given call. Meaning
`spy.getCallArguments(num)` does return the (num + 1)'th call arguments.


### getFirstCallArgument
```
spy.getFirstCallArgument(callNr:number = 0) => any
```
Same as [getCallArguments](#getcallarguments) but returns the only the first entry out
of the array of arguments. Most useful in situations where exactly one call param is expected.

### getCallCount
```
spy.getCallCount() => number
```
This method simply returns the number of made calls on the spy.

### showCallArguments
```
spy.showCallArguments(additionalInformation:Array<string> = []) => string
```
This primarily internally used method is responsible for returning formatted informative debug
messages when facts are broken. Let's do an example:
```js
const spy = new Spy('my awesome spy');
spy(42, 'test', {attr1: [1, 2, new Date(2017, 1, 20)], attr2: 1337});
spy(42, 'test', {attr1: [0, 2, new Date(2017, 1, 20)], attr2: 1336});
spy(42, 'test', {attr1: [1, 2, new Date(2017, 1, 21)], attr2: 1336});
spy(42, 'tes', {attr1: [1, 2, new Date(2017, 1, 20)], attr2: 1336});
spy(42, 'test');
```
The following broken fact...
```js
spy.wasCalledWith(42, 'test', {attr1: [1, 2, new Date(2017, 1, 20)], attr2: 1336});
```
...would produce the following error output:
```
Error: 
	
For my awesome spy did not find call arguments:

    --> [42,"test",{"attr1":[1,2,"2017-02-19T23:00:00.000Z"],"attr2":1336}]

Actually there were:

call 0: [42,"test",{"attr1":[1,2,"2017-02-19T23:00:00.000Z"],"attr2":1337}]
        --> 2 / attr2 / different number
call 1: [42,"test",{"attr1":[0,2,"2017-02-19T23:00:00.000Z"],"attr2":1336}]
        --> 2 / attr1 / 0 / different number
call 2: [42,"test",{"attr1":[1,2,"2017-02-20T23:00:00.000Z"],"attr2":1336}]
        --> 2 / attr1 / 2 / different date
call 3: [42,"tes",{"attr1":[1,2,"2017-02-19T23:00:00.000Z"],"attr2":1336}]
        --> 1 / different string
call 4: [42,"test"]
        different key length
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

## Changes

* **1.0.7:**
  * Removed expect-dev-dependency.
  * Added `getCallCount`.
  * Updated some debug messages. 
* **1.0.6:**
  * Updated Babel and transpiled es6-Symbols for older browsers.
* **1.0.5:**
  * Switched to es6-Symbols to make the access of private spy properties less accessible.
  * Added a persistence layer for spies.
* **1.0.4:**
  * Added checks to avoid spying on spies.
  
## Planned

* *After*-methods for `calls`, `returns` and `throws`.
* Update of Dev-dependencies.
* Upgrade of Dev-environment.