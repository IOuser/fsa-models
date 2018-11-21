import { Failure, Success } from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

import { ReducersActionsCreators, EffectsActionsCreators, Reducer } from './types';

export type ReducersParams<S, R, E> = {
    name: string;
    state: S;
    reducers: R;
    effects: E;
    actionsCreators: ReducersActionsCreators<R>;
    asyncActionsCreators: EffectsActionsCreators<E>;
}

export function prepareReducer<S, R, E>(params: ReducersParams<S, R, E>): Reducer {
    const { name, state, reducers, effects, actionsCreators, asyncActionsCreators } = params;
    const reducerBuilder = reducerWithInitialState<S>(state);

    const reducersKeys = Object.keys(reducers);
    const effectsKeys = Object.keys(effects);

    for (const key in reducers) {
        const reducer = reducers[key] as unknown as Reducer;
        const actionCreator = actionsCreators[key];

        // reducersKeys includes effectsKeys
        if (effectsKeys.includes(key)) {
            if (actionCreator === undefined) {
                throw Error(`${name}:${key} effect is not handled`);
            }

            const asyncActionCreators = asyncActionsCreators[key as unknown as keyof E];
            reducerBuilder.case(asyncActionCreators.started, (state: any) => ({
                ...state,
                _effects: {
                    ...state._effects,
                    [key]: {
                        error: null,
                        performing: true,
                    },
                },
            }));

            reducerBuilder.case(asyncActionCreators.failed, (state: any, { error }: Failure<unknown, Error>) => ({
                ...state,
                _effects: {
                    ...state._effects,
                    [key]: {
                        error,
                        performing: false,
                    },
                },
            }));

            reducerBuilder.case(asyncActionCreators.done, (state: any, { result }: Success<unknown, any>) => ({
                ...reducer(state, result),
                _effects: {
                    ...state._effects,
                    [key]: {
                        error: null,
                        performing: false,
                    },
                },
            }));

            continue;
        }

        reducerBuilder.case(actionCreator, reducer)
    }

    return reducerBuilder.build();
}
