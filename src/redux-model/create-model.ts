import { createSelector } from 'reselect';

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

export type EffectState = {
    error: null | string;
    performing: boolean;
}

export type ResultState<S, E> = S & {
    _effects?: {
        [key in keyof E]?: EffectState;
    };
}

export type Model<S, E, H> = {
    name: string;
    state: ResultState<S, E>;
    actions: ActionCreators<H, E>,
    reducer: Reducer<ResultState<S, E>>;
    saga: Saga;
    selectors: {
        stateSelector(rootState: unknown): ResultState<S, E>;
        performSelector(rootState: unknown): Record<keyof E, boolean>;
        errorsSelector(rootState: unknown): Record<keyof E, string | null>;
    }
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

    const stateSelector = (rootState: any): ResultState<S, E> => rootState[name];

    return {
        name,
        state,
        actions,
        reducer,
        saga,
        selectors: {
            stateSelector,
            performSelector: createSelector(stateSelector, (state: S) => {
                const result = {} as Record<keyof E, boolean>;

                for (const key in effects) {
                    result[key] = getEffectState(state, key as keyof E, 'performing', false);
                }

                return result;
            }),
            errorsSelector: createSelector(stateSelector, (state: S) => {
                const result = {} as Record<keyof E, string | null>;

                for (const key in effects) {
                    result[key] = getEffectState(state, key as keyof E, 'error', null);
                }

                return result;
            })
        }
    };
}

export function validateModelConfig<S, E, H>(config: ModelConfig<S, E, H>): ModelConfig<S, E, H> {
    if (process.env.NODE_ENV === 'production') {
        return config;
    }

    const { name, handlers, effects } = config;
    const handlersKeys = Object.keys(handlers);
    const effectsKeys = Object.keys(effects);

    for (const effectKey of effectsKeys) {
        if (!handlersKeys.includes(effectKey)) {
            console.warn(`${name}:${effectKey} effect doesn't have handler`);
        }
    }

    return config;
}


function getEffectState<S, E, K extends keyof EffectState>(state: ResultState<S, E>, effect: keyof E, key: K, def: EffectState[K]): EffectState[K] {
    const effectsState = state._effects;
    if (effectsState === undefined) {
        return def;
    }

    const effectState = effectsState[effect];
    if (effectState === undefined) {
        return def;
    }

    return effectState[key];
}
