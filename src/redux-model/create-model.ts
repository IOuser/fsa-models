import { createSelector } from 'reselect';
import get from 'lodash/get';

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
    selectors: {
        stateSelector(rootState: unknown): S;
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

    const stateSelector = (rootState: any): S => rootState[name];

    return {
        name,
        state,
        actions,
        reducer,
        saga,
        selectors: {
            stateSelector,
            performSelector: createSelector(stateSelector, (state: S) => {
                const r = {} as Record<keyof E, boolean>;

                for (const key in effects) {
                    r[key] = get(state, `_effects[${key}].performing`, false);
                }

                return r;
            }),
            errorsSelector: createSelector(stateSelector, (state: S) => {
                const r = {} as Record<keyof E, string | null>;

                for (const key in effects) {
                    r[key] = get(state, `_effects[${key}].error`, null)
                }

                return r;
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
