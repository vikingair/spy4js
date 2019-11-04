
const Comparator = (arg: any) => boolean | undefined;
type SpyComparator = {
    compare(arg: any): string | undefined;
};

const COMPARE = (comparator: Comparator) => SpyComparator;
const MAPPER = (from: any | any[], to: any) => SpyComparator;
const OptionalMessageOrError = string | Error | null | undefined;

type SpyInstance = {
    (...args: any[]): any,
    configure: (config: {
        useOwnEquals?: boolean,
        persistent?: boolean,
    }) => SpyInstance,
    calls: (...funcs: Function[]) => SpyInstance,
    returns: (...args: any[]) => SpyInstance,
    resolves: (...args: any[]) => SpyInstance,
    rejects: (...msgOrErrors: OptionalMessageOrError[]) => SpyInstance,
    throws: (msgOrError: OptionalMessageOrError) => SpyInstance,
    reset: () => SpyInstance,
    restore: () => SpyInstance,
    transparent: () => SpyInstance,
    transparentAfter: (callCount: number) => SpyInstance,
    wasCalled: (callCount?: number) => undefined,
    hasCallHistory: (...callHistory: Array<any[] | any>) => undefined,
    wasNotCalled: () => undefined,
    wasCalledWith: (...args: any[]) => undefined,
    wasNotCalledWith: (...args: any[]) => undefined,
    getCallArguments: (callNr?: number) => any[],
    getCallArgument: (callNr?: number, argNr?: number) => any,
    getCallCount: () => number,
    showCallArguments: (additionalInformation?: string[]) => string,
};

type ISpy = {
    new(name?: string): SpyInstance;
    configure(config: {
        useOwnEquals?: boolean,
        afterEach?: (scope: string) => undefined,
        beforeEach?: (scope: string) => undefined,
    }): undefined;
    IGNORE: Symbol;
    COMPARE: typeof COMPARE;
    MAPPER: typeof MAPPER;
    on<T, K extends keyof T>(obj: T, methodName: K): SpyInstance;
    mock<T, K extends keyof T>(obj: T, ...methodNames: K[]): { [P in K]: SpyInstance };
    mockModule<K extends string>(moduleName: string, ...methodNames: K[]): { [P in K]: SpyInstance };
    initMocks(scope?: string): undefined;
    restoreAll(): undefined;
    resetAll(): undefined;
};

export const Spy: ISpy;
