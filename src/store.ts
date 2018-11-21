import { createStore, applyMiddleware, compose, Store, Reducer } from 'redux';
import sagaMiddlewareFactory, { SagaIterator } from 'redux-saga';

const composeEnhancers: typeof compose =
    process.env.NODE_ENV !== 'production' ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose : compose;

export function configureStore<S>(
    initialState: S,
    rootReducer: Reducer,
    rootSaga: () => SagaIterator,
): Store<S> {
    const sagaMiddleware = sagaMiddlewareFactory();
    const store = createStore(rootReducer, initialState, composeEnhancers(applyMiddleware(sagaMiddleware)));

    // run sagas
    sagaMiddleware.run(rootSaga);

    return store;
}
