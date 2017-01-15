/*
 * @flow
 */

import expect from 'expect';
import {SpyRegistry} from './registry';

/**
 * The tests are written not method specific.
 * Meaning that storing objects information
 * does not restrict to functions although this
 * will be the central use case for the spy utils.
 */
describe('Spy - Utils', () => {
    it('should not allow to use the constructor of the Spy without new', () => {
        expect(() => SpyRegistry()).toThrow(); // eslint-disable-line
    });

    it('should register an arbitrary object attribute correctly', () => {
        const testObject = {attr1: 'string', attr2: 88, attr3: new Date()};
        const reg:any = new SpyRegistry();

        const returnedRegisterCount = reg.push(testObject, 'attr1');

        expect(reg.registerCount).toBe(1);
        expect(returnedRegisterCount).toBe(1);
        expect(reg.register[1].obj).toBe(testObject);
        expect(reg.register[1].method).toBe(testObject.attr1);
        expect(reg.register[1].methodName).toBe('attr1');
    });

    it('should be able to restore a registered object', () => {
        const someDate = new Date();
        const testObject = {attr1: 'string', attr2: 88, attr3: someDate};
        const reg:any = new SpyRegistry();

        const registerEntry1 = reg.push(testObject, 'attr1');
        const registerEntry2 = reg.push(testObject, 'attr2');

        const someFunc:any = () => {};
        testObject.attr1 = someFunc;
        delete testObject.attr2;

        expect(testObject.attr1).toBe(someFunc);
        expect(testObject.attr2).toBe(undefined);
        expect(testObject.attr3).toBe(someDate);

        reg.restore(registerEntry1);

        expect(testObject.attr1).toBe('string');
        expect(testObject.attr2).toBe(undefined);
        expect(testObject.attr3).toBe(someDate);

        reg.restore(registerEntry2);

        expect(testObject.attr1).toBe('string');
        expect(testObject.attr2).toBe(88);
        expect(testObject.attr3).toBe(someDate);
    });

    it('should be able to restore all ' +
        'registered objects properties at once', () => {
        const someDate = new Date();
        const testObject = {attr1: 'string', attr2: 88, attr3: someDate};
        const reg:any = new SpyRegistry();

        reg.push(testObject, 'attr1');
        reg.push(testObject, 'attr2');

        const someFunc:any = () => {};
        testObject.attr1 = someFunc;
        delete testObject.attr2;

        expect(testObject.attr1).toBe(someFunc);
        expect(testObject.attr2).toBe(undefined);
        expect(testObject.attr3).toBe(someDate);

        reg.restoreAll();

        expect(testObject.attr1).toBe('string');
        expect(testObject.attr2).toBe(88);
        expect(testObject.attr3).toBe(someDate);
    });

    it('should be able to to return the stored value' +
        ' without restoring the object', () => {
        const someDate = new Date();
        const testObject = {attr1: 'string', attr2: 88, attr3: someDate};
        const reg:any = new SpyRegistry();

        const registerEntry1 = reg.push(testObject, 'attr1');
        const registerEntry2 = reg.push(testObject, 'attr2');

        const someFunc:any = () => {};
        testObject.attr1 = someFunc;
        delete testObject.attr2;

        expect(testObject.attr1).toBe(someFunc);
        expect(testObject.attr2).toBe(undefined);
        expect(testObject.attr3).toBe(someDate);

        expect(reg.getOriginalMethod(registerEntry1)).toBe('string');
        expect(reg.getOriginalMethod(registerEntry2)).toBe(88);

        expect(testObject.attr1).toBe(someFunc);
        expect(testObject.attr2).toBe(undefined);
        expect(testObject.attr3).toBe(someDate);
    });
});
