import { createModel } from './redux-model/create-model';

const modelConfig = {
    name: 'testModel',
    state: {
        number: 0,
        sync: null,
    },
    effects: {
        async loadNumber(params: { delay?: number }): Promise<any> {
            // throw Error('Some error');
            const result = await new Promise<number>(r => setTimeout(() => r(42), params.delay || 2000));
            return result;
        },
    },
    reducers: {
        loadNumber(state: any, payload: number): any {
            return {
                ...state,
                number: payload,
            }
        },
        somethingSync(state: any, payload: any): any {
            return {
                ...state,
                sync: payload,
            };
        }
    },
}

export const model = createModel(modelConfig);
console.log(model);

// TODO: Extract test cases
let s: any = {};
s = model.reducer(s, model.asyncActionsCreators.loadNumber.started({}))
console.log(s);

s = model.reducer(s, model.asyncActionsCreators.loadNumber.done({ params: {}, result: 42 }))
console.log(s);

s = model.reducer(s, model.asyncActionsCreators.loadNumber.failed({ params: {}, error: new Error("Error while loading 42") }))
console.log(s);

s = model.reducer(s, model.actionsCreators.somethingSync('foo bar'))
console.log(s);
