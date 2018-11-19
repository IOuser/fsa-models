import React from 'react';
import { render } from 'react-dom';
import { connect, Provider } from 'react-redux'


import { init } from '@rematch/core';
import loadingPlugin from '@rematch/loading';


import * as models from './model';

const store = init({
    models,
    plugins: [loadingPlugin()]
})

type Dispatch = typeof store.dispatch;

const Test = connect(
    state => ({ state }),
    (dispatch: any) => {
        const d = dispatch as Dispatch;
        return ({
            loadSources: d.sourcesModel.loadSource,
        });
    }
)(({ state, loadSources }: any) => {
    return (
        <>
            <button onClick={() => loadSources()}>click</button>
            <pre>
                {JSON.stringify(state, null, '  ')}
            </pre>
        </>
    );
})




const root = document.getElementById('root');
render(<Provider store={store}><Test /></Provider>, root);