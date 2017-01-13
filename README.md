 
# spy4js [![npm package][npm-badge]][npm]

[npm-badge]: https://img.shields.io/npm/v/spy4js.svg?style=flat-square
[npm]: https://www.npmjs.org/package/spy4js

### Introduction

**spy4js** provides a stand-alone spy framework. It is decoupled by any dependecies and other assertion frameworks. Other than most test frameworks it uses a different - maybe you will need to get used to - test notation. It does not make assertion, which are expected to be fulfilled on runtime, but displays facts, that are considered to be fulfilled on runtime. And if this fact is not true, it will throw an exception. I consider the way of writing facts more regular because it fits more to the rest of the written code.

**spy4js** comes with the one interesting (es6 like) class `Spy`. The spy instances are treated as class instances and come with a lot of useful features. See below for more.

### Installation (TODO)

### Interface

A spy instance can be initialized differently.

```js
import {Spy} from 'spy4js';

// initialize directly
const spy1 = new Spy();

// initialize directly and supply an identifier for debugging purpose (default: 'the spy')
const spy2 = new Spy('special spy for me');

// initialize by mocking another objects attribute (usually this attribute is a function)
const someObject = new Date(2017, 01, 15);
const spy3 = Spy.on(someObject, 'toJSON');

// initialize many by mocking another objects attributes
const someObject = new Date(2017, 01, 15);
const [spy4, spy5, spy6] = Spy.onMany(someObject, 'toJSON', 'toString', 'getDate');
```

### More to come