import { Action } from 'typescript-fsa';
import { bindAsyncAction } from 'typescript-fsa-redux-saga';
import { SagaIterator } from 'redux-saga';
import { all, takeLatest, ForkEffect, call } from 'redux-saga/effects';

import { ActionCreatorsFromHandlers, AsyncActionCreatorsFromEffects, Saga } from './types';

const workerParams = {
    skipStartedAction: true,
};

export type SagasParams<S, R, E> = {
    name: string;
    state: S;
    handlers: R;
    effects: E;
    actionCreators: ActionCreatorsFromHandlers<R>;
    asyncActionCreators: AsyncActionCreatorsFromEffects<E>;
};

export function prepareSaga<S, R, E>(params: SagasParams<S, R, E>): Saga {
    const { name, effects, asyncActionCreators } = params;

    const binds: ForkEffect[] = [];

    for (const key in effects) {
        const fn: any = effects[key];
        const actionCreator = asyncActionCreators[key];

        const effectWorker = bindAsyncAction(actionCreator, workerParams)(function*(payload: unknown): SagaIterator {
            return yield call(fn, payload);
        });

        const effectSaga = function*({ payload }: Action<any>): SagaIterator {
            try {
                yield call(effectWorker, payload);
            } catch (err) {
                console.error(`${name}:${key} failed: ${err.toString()}`);
            }
        };

        binds.push(takeLatest(actionCreator.started, effectSaga));
    }

    return function* preparedSaga(): SagaIterator {
        yield all(binds);
    };
}
