
const Comparator = (arg: unknown) => boolean;
interface SpyComparator {
    compare(arg: unknown): string | undefined;
}

const COMPARE = (comparator: Comparator) => SpyComparator;
const OptionalMessageOrError = string | Error | null | undefined;

interface SpyInstance {
    (...args: unknown[]): unknown,
    configure: (config: {
        useOwnEquals?: boolean,
        persistent?: boolean,
    }) => SpyInstance,
    calls: (...funcs: Function[]) => SpyInstance,
    returns: (...args: unknown[]) => SpyInstance,
    resolves: (...args: unknown[]) => SpyInstance,
    rejects: (...msgOrErrors: OptionalMessageOrError[]) => SpyInstance,
    throws: (msgOrError: OptionalMessageOrError) => SpyInstance,
    reset: () => SpyInstance,
    restore: () => SpyInstance,
    transparent: () => SpyInstance,
    transparentAfter: (callCount: number) => SpyInstance,
    wasCalled: (callCount?: number) => undefined,
    hasCallHistory: (...callHistory: Array<unknown[] | unknown>) => undefined,
    wasNotCalled: () => undefined,
    wasCalledWith: (...args: unknown[]) => undefined,
    wasNotCalledWith: (...args: unknown[]) => undefined,
    getCallArguments: (callNr?: number) => unknown[],
    getCallArgument: (callNr?: number, argNr?: number) => unknown,
    getCallCount: () => number,
    showCallArguments: (additionalInformation?: string[]) => string,
};

interface ISpy {
    new(name: string = ''): SpyInstance;
    configure(config: {
        useOwnEquals?: boolean,
        afterEach?: (scope: string) => undefined,
        beforeEach?: (scope: string) => undefined,
    }): undefined;
    IGNORE: Symbol;
    COMPARE: typeof COMPARE;
    on(obj: Object, methodName: string): SpyInstance;
    mock<T, K extends keyof T>(
        obj: T,
        ...methodNames: K[]
    ): { [K]: SpyInstance };
    initMocks(scope?: string): undefined;
    restoreAll(): undefined;
    resetAll(): undefined;
}

export const Spy: ISpy; // want to import ISpy
