/**
 * Those symbols are used to protect the private spy properties from outer manipulation by mistake.
 */
const symbolName = Symbol('__Spy_name__');
const symbolSnap = Symbol('__Spy_snap__');
const symbolSnapSerializer = Symbol('__Spy_snapSerializer__');
const symbolIsSpy = Symbol('__Spy_isSpy__');
const symbolFunc = Symbol('__Spy_func__');
const symbolCalls = Symbol('__Spy_calls__');
const symbolConfig = Symbol('__Spy_config__');
const symbolIndex = Symbol('__Spy_index__');
export const Symbols = {
    name: symbolName,
    snap: symbolSnap,
    snapSerializer: symbolSnapSerializer,
    isSpy: symbolIsSpy,
    func: symbolFunc,
    calls: symbolCalls,
    config: symbolConfig,
    index: symbolIndex,
} as const;
