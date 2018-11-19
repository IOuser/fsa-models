import { createModel, RematchDispatch, ModelEffects } from '@rematch/core';

type Source = {
    id: string;
    ignored: boolean;
    name: string;
}

export type State = {
    sources: Record<string, Source>
    ids: string[];
    ignoredIds: string[],
}


export const sourcesModel = createModel<State>({
    state: {
        sources: {},
        ids: [],
        ignoredIds: [],
    },

    reducers: {
        setSources(state: State, payload: Source[]): State {
            const ids = payload.filter(s => !s.ignored).map(s => s.id);
            const ignoredIds = payload.filter(s => s.ignored).map(s => s.id);

            const sources = payload.reduce((acc: Record<string, Source>, source: Source) => {
                acc[source.id] = source;
                return acc;
            }, {})

            return {
                ...state,
                ids,
                ignoredIds,
                sources: {
                    ...state.sources,
                    ...sources,
                }
            }
        }
    },

    effects(_dispatch: RematchDispatch): ModelEffects<State> {
        return {
            async loadSource() {
                await new Promise(r => setTimeout(r, 2000));

                const sources: Source[] = [
                    { id: '1', name: 'Name 1', ignored: false },
                    { id: '2', name: 'Name 2', ignored: false },
                    { id: '3', name: 'Name 3', ignored: false },
                    { id: '4', name: 'Name 4', ignored: true },
                ];

                this.setSources(sources)
            }
        }
    }
})