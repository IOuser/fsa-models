import React from 'react';
import { render } from 'react-dom';
import { connect, Provider } from 'react-redux'

import { model } from './model';

import { configureStore } from './store';
import { combineReducers, Reducer, Dispatch } from 'redux';
import { all, fork } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';

export function* rootSaga(): SagaIterator {
    yield all([
        fork(model.saga),
    ])
}

type RootState = {
    testModel: typeof model['state'];
}

const rootReducer = combineReducers<RootState>({ [model.name]: model.reducer as Reducer } as any)

const store = configureStore<RootState>({ [model.name]: model.state } as RootState, rootReducer, rootSaga);;

const Test = connect(
    state => ({ state }),
    (dispatch: Dispatch) => {
        return ({
            loadNumber: () => dispatch(model.actions.loadNumber({})),
            syncAction: () => dispatch(model.actions.somethingSync(42)),
        });
    }
)(({ state, loadNumber, syncAction }: any) => {
    return (
        <>
            <button onClick={() => loadNumber()}>click</button>
            <button onClick={syncAction}>sync</button>
            <pre>
                {JSON.stringify(state, null, '  ')}
            </pre>
        </>
    );
})

const root = document.getElementById('root');
render(<Provider store={store}><Test /></Provider>, root);
