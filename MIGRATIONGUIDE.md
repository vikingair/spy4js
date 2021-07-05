# Migration Guide
You can find here tips for migrating breaking changes.

## 2.0.0
- If you have previously added an own hook, which called `Spy.restoreAll` after each test suite, you may remove it.
- If you get troubles with the automatically added test hooks, you can override/remove it by usage of `Spy.configure`
- If you have used `Spy.onMany` you have to switch to `Spy.mock`. Depending on your special case, this can get aweful. Here an example, how someone could accomplish it. Let's assume this v1 code:
```js
describe('Test', () => {
    let spy1 = new Spy();
    let spy2 = new Spy();

    beforeEach(() => {
        [spy1, spy2] = Spy.onMany(LOG, 'error', 'info');
    });

    it('logs an info if job runs', () => {
        // run the job (...)
        spy1.wasNotCalled();
        spy2.hasCallHistory('job finished');
    });
});
```
This can be changed to:
```js
// I recommend to initialize mocks ouside of the describe-Block (or update to 2.1 which includes scoped mocks)
const Mock$LOG = Spy.mock(LOG, 'error', 'info');

describe('Test', () => {
    it('logs an info if job runs', () => {
        // run the job (...)
        Mock$LOG.error.wasNotCalled();
        Mock$LOG.info.hasCallHistory('job finished');
    });
});
```
Notice how much more readable the test code became. Have fun :v:
