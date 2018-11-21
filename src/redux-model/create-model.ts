import { Saga, Reducer, ActionCreators } from './types';
import { prepareReducer } from './prepare-reducer';
import { prepareActionCreators, prepareAsyncActionCreators, prepareAcrions } from './prepare-action-creators';
import { prepareSaga } from './prepare-saga';


export type ModelConfig<S, E, H> = {
    name: string;
    state: S;
    effects: E;
    handlers: H;
}

export type Model<S, E, H> = {
    name: string;
    state: S;
    actions: ActionCreators<H, E>,
    reducer: Reducer<S>;
    saga: Saga;
}

export function createModel<S, E, H>(config: ModelConfig<S, E, H>): Model<S, E, H> {
    validateModelConfig(config);

    const { name, handlers, effects, state } = config;

    const actionCreators = prepareActionCreators(name, handlers);
    const asyncActionCreators = prepareAsyncActionCreators(name, effects);

    const reducer = prepareReducer({
        name,
        state,
        handlers,
        effects,
        actionCreators,
        asyncActionCreators,
    });

    const saga = prepareSaga({
        name,
        state,
        handlers,
        effects,
        actionCreators,
        asyncActionCreators,
    });

    const actions = prepareAcrions(actionCreators, asyncActionCreators);

    return { name, state, actions, reducer, saga };
}

export function validateModelConfig<S, E, H>(config: ModelConfig<S, E, H>): ModelConfig<S, E, H> {
    if (process.env.NODE_ENV === 'production') {
        return config;
    }

    const { handlers, effects } = config;
    const handlersKeys = Object.keys(handlers);
    const effectsKeys = Object.keys(effects);

    for (const effectKey of effectsKeys) {
        console.assert(handlersKeys.includes(effectKey), `${effectKey} doesn't have handler`);
    }

    return config;
}