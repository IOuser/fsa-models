import React from 'react';
import { render } from 'react-dom';
import { connect, Provider } from 'react-redux';

import { model } from './model';

import { configureStore } from './store';
import { combineReducers, Reducer, Dispatch } from 'redux';
import { all, fork } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';

export function* rootSaga(): SagaIterator {
    yield all([fork(model.saga)]);
}

type RootState = {
    testModel: typeof model['state'];
};

const rootReducer = combineReducers<RootState>({ [model.name]: model.reducer as Reducer } as any);

const store = configureStore<RootState>({ [model.name]: model.state } as RootState, rootReducer, rootSaga);

const Test = connect(
    (rootState: RootState) => ({
        rootState,
        performing: model.selectors.performSelector(rootState),
        errors: model.selectors.errorsSelector(rootState),
    }),
    (dispatch: Dispatch) => {
        return {
            loadNumber: () => dispatch(model.actions.loadNumber({})),
            syncAction: () => dispatch(model.actions.somethingSync(42)),
        };
    },
)(({ rootState, performing, errors, loadNumber, syncAction }: any) => {
    return (
        <>
            <button onClick={() => loadNumber()}>Async action</button>
            &nbsp;
            <button onClick={syncAction}>Sync action</button>
            <div>Root state:</div>
            <pre>{JSON.stringify(rootState, null, '  ')}</pre>
            <div>Performing selector:</div>
            <pre>{JSON.stringify(performing, null, '  ')}</pre>
            <div>Errors selector:</div>
            <pre>{JSON.stringify(errors, null, '  ')}</pre>
        </>
    );
});

const root = document.getElementById('root');
render(
    <Provider store={store}>
        <Test />
    </Provider>,
    root,
);
