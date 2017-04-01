/*
 * @flow
 */

import {equals, throws} from './test-utils/test.utils';
import {SpyRegistry} from './registry';
import {objectKeys} from './utils';

/**
 * The tests are written not method specific.
 * Meaning that storing objects information
 * does not restrict to functions although this
 * will be the central use case for the spy utils.
 */
describe('Spy - Utils', () => {
    it('should not allow to use the constructor of the Spy without new', () => {
        throws(SpyRegistry);
    });

    it('should register an arbitrary object attribute correctly', () => {
        const testObject = {attr1: 'string', attr2: 88, attr3: new Date()};
        const reg:any = new SpyRegistry();

        const returnedRegisterCount = reg.push(testObject, 'attr1');

        equals(reg.registerCount, 1);
        equals(returnedRegisterCount, 1);
        equals(reg.register[1].obj, testObject);
        equals(reg.register[1].method, testObject.attr1);
        equals(reg.register[1].methodName, 'attr1');
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

        equals(testObject.attr1, someFunc);
        equals(testObject.attr2, undefined);
        equals(testObject.attr3, someDate);

        reg.restoreAll();

        equals(testObject.attr1, 'string');
        equals(testObject.attr2, 88);
        equals(testObject.attr3, someDate);
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
            func2: () => 'testObjectFunc1'};
        const reg:any = new SpyRegistry();

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
});
