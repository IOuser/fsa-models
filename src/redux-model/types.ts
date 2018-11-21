import { ActionCreator, AsyncActionCreators } from "typescript-fsa";

export type Reducer<S = any, P = any> = (state: S, paylaod: P) => S;

export type ReducersActionsCreators<T> = {
    [P in keyof T]: T[P] extends Reducer<any, infer U>
        ? ActionCreator<U>
        : never;
}

export type Effect<P, R> = (params: P) => Promise<R>;

export type EffectsActionsCreators<T> = {
    [P in keyof T]: T[P] extends Effect<infer Params, infer Result>
        ? AsyncActionCreators<Params, Result, Error>
        : never;
}
