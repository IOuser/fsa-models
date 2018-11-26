import { createModel } from '../../../src/create-model';

export const model = createModel({
    name: 'testModel',
    state: {
        number: 0,
        sync: null,
    },
    effects: {
        async loadNumber(params: { delay?: number }): Promise<any> {
            // throw Error('kekekek')
            const result = await new Promise<number>(r => setTimeout(() => r(42), params.delay || 1000));
            return result;
        },
        async loadString(params: object): Promise<any> {
            throw Error('Some error');
        },
    },
    handlers: {
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
});

// TODO: Extract test cases
// console.log(model);

// type TTT = typeof model.actions;

// model.actions.loadNumber({})
// model.actions.somethingSync({});

// let s: any = {};
// s = model.reducer(s, model.asyncActionsCreators.loadNumber.started({}))
// console.log(s);

// s = model.reducer(s, model.asyncActionsCreators.loadNumber.done({ params: {}, result: 42 }))
// console.log(s);

// s = model.reducer(s, model.asyncActionsCreators.loadNumber.failed({ params: {}, error: new Error("Error while loading 42") }))
// console.log(s);

// s = model.reducer(s, model.actionsCreators.somethingSync('foo bar'))
// console.log(s);
