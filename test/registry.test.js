/**
 * This file is part of spy4js which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import { equals, throws } from '../util/facts';
import { SpyRegistry } from '../src/registry';
import { objectKeys } from '../src/utils';

/**
 * The tests are written not method specific.
 * Meaning that storing objects information
 * does not restrict to functions although this
 * will be the central use case for the spy utils.
 */
describe('Spy - Utils', () => {
    it('should not allow to use the constructor of the Spy without new', () => {
        throws(SpyRegistry, { partOfMessage: 'only with "new" keyword' });
    });

    it('should register an arbitrary object attribute correctly', () => {
        const testObject = { attr1: 'string', attr2: 88, attr3: new Date() };
        const reg: any = new SpyRegistry();

        const returnedRegisterCount = reg.push(testObject, 'attr1');

        equals(reg.registerCount, 1);
        equals(returnedRegisterCount, 1);
        equals(reg.register[1].obj, testObject);
        equals(reg.register[1].method, testObject.attr1);
        equals(reg.register[1].methodName, 'attr1');
    });

    it('does nothing on restore for not existing key', () => {
        const testObject = { func: () => {} };
        const expectedRegisterEntry = {
            obj: testObject,
            method: testObject.func,
            methodName: 'func',
        };

        const reg: any = new SpyRegistry();

        const key = reg.push(testObject, 'func');
        equals(reg.register, { [key]: expectedRegisterEntry });

        reg.restore(123);
        equals(reg.register, { [key]: expectedRegisterEntry });
    });

    it('does only delete the register entry on restore if stored object has invalid structure', () => {
        const reg: any = new SpyRegistry();
        reg.register[1] = { noObjKey: 'here' };
        reg.restore(1);
        equals(reg.register, {});
    });

    it('should be able to restore a registered object', () => {
        const someDate = new Date();
        const testObject = { attr1: 'string', attr2: 88, attr3: someDate };
        const reg: any = new SpyRegistry();

        const registerEntry1 = reg.push(testObject, 'attr1');
        const registerEntry2 = reg.push(testObject, 'attr2');

        const someFunc: any = () => {};
        testObject.attr1 = someFunc;
        delete testObject.attr2;

        equals(testObject.attr1, someFunc);
        equals(testObject.attr2, undefined);
        equals(testObject.attr3, someDate);

        reg.restore(registerEntry1);

        equals(testObject.attr1, 'string');
        equals(testObject.attr2, undefined);
        equals(testObject.attr3, someDate);

        reg.restore(registerEntry2);

        equals(testObject.attr1, 'string');
        equals(testObject.attr2, 88);
        equals(testObject.attr3, someDate);
    });

    it('should be able to restore all registered objects properties at once', () => {
        const someDate = new Date();
        const testObject = { attr1: 'string', attr2: 88, attr3: someDate };
        const reg: any = new SpyRegistry();

        reg.push(testObject, 'attr1');
        reg.push(testObject, 'attr2');

        const someFunc: any = () => {};
        testObject.attr1 = someFunc;
        delete testObject.attr2;

        equals(testObject.attr1, someFunc);
        equals(testObject.attr2, undefined);
        equals(testObject.attr3, someDate);

        reg.restoreAll();

        equals(testObject.attr1, 'string');
        equals(testObject.attr2, 88);
        equals(testObject.attr3, someDate);
    });

    it('should be able to to return the stored value without restoring the object', () => {
        const someDate = new Date();
        const testObject = { attr1: 'string', attr2: 88, attr3: someDate };
        const reg: any = new SpyRegistry();

        const registerEntry1 = reg.push(testObject, 'attr1');
        const registerEntry2 = reg.push(testObject, 'attr2');

        const someFunc: any = () => {};
        testObject.attr1 = someFunc;
        delete testObject.attr2;

        equals(testObject.attr1, someFunc);
        equals(testObject.attr2, undefined);
        equals(testObject.attr3, someDate);

        equals(reg.getOriginalMethod(registerEntry1), 'string');
        equals(reg.getOriginalMethod(registerEntry2), 88);

        equals(testObject.attr1, someFunc);
        equals(testObject.attr2, undefined);
        equals(testObject.attr3, someDate);
    });

    it('is able to make stored information persistent', () => {
        const testObject = {
            func1: () => 'testObjectFunc1',
            func2: () => 'testObjectFunc1',
        };
        const reg: any = new SpyRegistry();

        equals(objectKeys(reg.register).length, 0);
        equals(objectKeys(reg.persReg).length, 0);

        const registerEntry1 = reg.push(testObject, 'func1');
        reg.push(testObject, 'func2');

        equals(objectKeys(reg.register).length, 2);
        equals(objectKeys(reg.persReg).length, 0);

        reg.persist(registerEntry1, true);

        equals(objectKeys(reg.register).length, 1);
        equals(objectKeys(reg.persReg).length, 1);

        reg.restore(registerEntry1);

        equals(objectKeys(reg.register).length, 1);
        equals(objectKeys(reg.persReg).length, 1);

        reg.restoreAll();

        equals(objectKeys(reg.register).length, 0);
        equals(objectKeys(reg.persReg).length, 1);

        reg.persist(registerEntry1, false);

        equals(objectKeys(reg.register).length, 1);
        equals(objectKeys(reg.persReg).length, 0);

        reg.restoreAll();

        equals(objectKeys(reg.register).length, 0);
        equals(objectKeys(reg.persReg).length, 0);
    });

    it('does nothing on persist for not existing key', () => {
        const testObject = { func: () => {} };

        const reg: any = new SpyRegistry();

        const key = reg.push(testObject, 'func');
        equals(reg.register[key].obj, testObject);

        reg.persist(123, true);
        equals(reg.register[key].obj, testObject);
    });
});
