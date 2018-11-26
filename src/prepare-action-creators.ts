import { actionCreatorFactory, AsyncActionCreators } from "typescript-fsa";
import { ActionCreatorsFromHandlers, AsyncActionCreatorsFromEffects, ActionCreators, StartedAsyncActionCreatorsFromEffects } from "./types";

export function prepareAcrions<H, E>(
    actionCreators: ActionCreatorsFromHandlers<H>,
    asyncActionCreators: AsyncActionCreatorsFromEffects<E>
): ActionCreators<H, E> {
    const startedAsyncActionCreators = {} as StartedAsyncActionCreatorsFromEffects<E>;
    for (const key in asyncActionCreators) {
        startedAsyncActionCreators[key] = asyncActionCreators[key].started as any;
    }

    return {
        ...actionCreators as any,
        ...startedAsyncActionCreators as any,
    }
}

export function prepareActionCreators<H>(name: string, handlers: H): ActionCreatorsFromHandlers<H> {
    const factory = actionCreatorFactory(name);
    const actionCreators = {} as ActionCreatorsFromHandlers<H>;

    for (const key in handlers) {
        actionCreators[key] = factory(key) as any;
    }

    return actionCreators;
}

// TODO: Extract test cases
// const reducers = {
//     kek(state: number, payload: number): number { return 42; },
//     lal(state: number, payload: string | null): number { return 42; },
// }

// type TofR = typeof reducers;
// type RAC = ReducersActionsCreators<TofR>;

// const actionsCreators = prepareActionsCreators('kek', reducers);

// actionsCreators.kek(41);
// actionsCreators.lal(null);
// actionsCreators.lal('foo');

export function prepareAsyncActionCreators<E>(name: string, effects: E): AsyncActionCreatorsFromEffects<E> {
    const factory = actionCreatorFactory(name);

    const actionCreators = {} as AsyncActionCreatorsFromEffects<E>;

    for (const key in effects) {
        actionCreators[key] = factory.async(key) as any;
    }

    return actionCreators;
}


// TODO: Extract test cases
// const effects = {
//     async loadNumber(params: { delay?: number, foo: string | null }): Promise<number> {
//         const result = await new Promise<number>(r => setTimeout(() => r(42), params.delay || 2000));
//         return result;
//     },
//     async loadString(params: { delay?: number }): Promise<string> {
//         const result = await new Promise<string>(r => setTimeout(() => r('bar'), params.delay || 2000));
//         return result;
//     }
// }

// type TypeOfEffects = typeof effects;
// type EAC = EffectsActionsCreators<TypeOfEffects>;

// const asyncActionsCreators = prepareAsyncActionsCreators('kek', effects);

// asyncActionsCreators.loadNumber.started({ delay: 100, foo: null });
// asyncActionsCreators.loadNumber.started({ foo: 'bar' });
// asyncActionsCreators.loadNumber.done({ params: { delay: 100, foo: null }, result: 42 });
// asyncActionsCreators.loadNumber.done({ params: { foo: 'bar' }, result: 42 });