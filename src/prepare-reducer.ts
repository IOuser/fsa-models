import { Failure, Success } from 'typescript-fsa';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

import { ActionCreatorsFromHandlers, AsyncActionCreatorsFromEffects, Reducer } from './types';

export type ReducersParams<S, R, E> = {
    name: string;
    state: S;
    handlers: R;
    effects: E;
    actionCreators: ActionCreatorsFromHandlers<R>;
    asyncActionCreators: AsyncActionCreatorsFromEffects<E>;
};

export function prepareReducer<S, R, E>(params: ReducersParams<S, R, E>): Reducer {
    const { state, handlers, effects, actionCreators, asyncActionCreators } = params;
    const reducerBuilder = reducerWithInitialState<S>(state);

    const effectsKeys = Object.keys(effects);

    for (const key in handlers) {
        const handler = (handlers[key] as unknown) as Reducer;
        const actionCreator = actionCreators[key];

        // reducersKeys includes effectsKeys
        if (effectsKeys.includes(key)) {
            const asyncActionCreator = asyncActionCreators[(key as unknown) as keyof E];
            reducerBuilder.case(asyncActionCreator.started, (s: any) => ({
                ...s,
                _effects: {
                    ...s._effects,
                    [key]: {
                        error: null,
                        performing: true,
                    },
                },
            }));

            reducerBuilder.case(asyncActionCreator.failed, (s: any, { error }: Failure<unknown, Error>) => ({
                ...s,
                _effects: {
                    ...s._effects,
                    [key]: {
                        error: error.message || error.toString(),
                        performing: false,
                    },
                },
            }));

            reducerBuilder.case(asyncActionCreator.done, (s: any, { result }: Success<unknown, any>) => ({
                ...handler(s, result),
                _effects: {
                    ...s._effects,
                    [key]: {
                        error: null,
                        performing: false,
                    },
                },
            }));

            continue;
        }

        reducerBuilder.case(actionCreator, handler);
    }

    return reducerBuilder.build();
}
