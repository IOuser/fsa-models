import { ActionCreator, AsyncActionCreators } from "typescript-fsa";
import { SagaIterator } from "redux-saga";
import { Handler } from "typescript-fsa-reducers";

export type Reducer<S = any, P = any> = (state: S, paylaod: P) => S;
export type Saga = () => SagaIterator;

export type Effect<P, R> = (params: P) => Promise<R>;

export type ActionCreatorsFromHandlers<T> = {
    [P in keyof T]: T[P] extends Handler<unknown, unknown, infer U>
        ? ActionCreator<U>
        : never;
}

export type AsyncActionCreatorsFromEffects<T> = {
    [P in keyof T]: T[P] extends Effect<infer Params, infer Result>
        ? AsyncActionCreators<Params, Result, Error>
        : never;
}

// merged action creators types
type Key = string | number | symbol;
type Diff<T extends Key, U extends Key> = ({ [P in T]: P } & { [P in U]: never } & { [x: string]: never })[T];
type Overwrite<T, U> = { [P in Diff<keyof T, keyof U>]: T[P] } & U;

export type StartedAsyncActionCreatorsFromEffects<T> = {
    [P in keyof T]: T[P] extends Effect<infer Params, infer Result>
        ? AsyncActionCreators<Params, Result, Error>['started']
        : never;
}

export type ActionCreators<H, E> = Overwrite<ActionCreatorsFromHandlers<H>, StartedAsyncActionCreatorsFromEffects<E>>;
