import { actionCreatorFactory } from "typescript-fsa";
import { ReducersActionsCreators, EffectsActionsCreators } from "./types";

export function prepareActionsCreators<R>(name: string, reducers: R): ReducersActionsCreators<R> {
    const factory = actionCreatorFactory(name);

    const actionCreators: ReducersActionsCreators<R> = {} as any;

    for (const key in reducers) {
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

export function prepareAsyncActionsCreators<E>(name: string, effects: E): EffectsActionsCreators<E> {
    const factory = actionCreatorFactory(name);

    const actionCreators: EffectsActionsCreators<E> = {} as any;

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