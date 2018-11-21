import { SagaIterator } from 'redux-saga';
import { ReducersActionsCreators, EffectsActionsCreators, Reducer } from './types';
import { prepareReducer } from './prepare-reducer';
import { prepareActionsCreators, prepareAsyncActionsCreators } from './prepare-action-creators';
import { prepareSaga } from './prepare-saga';


export type ModelConfig<S, E, R> = {
    name: string;
    state: S;
    effects: E;
    reducers: R;
}

export type Model<S, E, R> = {
    name: string;
    state: S;
    // TODO: merge actions;
    actionsCreators: ReducersActionsCreators<R>;
    asyncActionsCreators: EffectsActionsCreators<E>;
    reducer: Reducer<S>;
    saga: () => SagaIterator;
}

export function createModel<S, E, R>(config: ModelConfig<S, E, R>): Model<S, E, R> {
    const { name, reducers, effects, state } = config;

    const actionsCreators = prepareActionsCreators(name, reducers);
    const asyncActionsCreators = prepareAsyncActionsCreators(name, effects);

    const reducer = prepareReducer({
        name,
        state,
        reducers,
        effects,
        actionsCreators,
        asyncActionsCreators,
    });

    const saga = prepareSaga({
        name,
        state,
        reducers,
        effects,
        actionsCreators,
        asyncActionsCreators,
    });

    return { name, state, actionsCreators, asyncActionsCreators, reducer, saga };
}