import { useCallback, useEffect, useState } from 'react'
import { DATA_CHANGED, request } from './api'

// Loads one or more GET endpoints in parallel and reloads them after any
// successful change elsewhere in the app. `paths` is { name: '/endpoint' }.
export function useApiData(paths) {
    const key = JSON.stringify(paths)
    const [state, setState] = useState({ data: null, error: '', loading: true })

    const load = useCallback(async () => {
        const entries = Object.entries(JSON.parse(key))
        const results = await Promise.all(entries.map(([, path]) => request('GET', path)))
        const failed = results.find(r => r.error)
        if (failed) {
            setState(s => ({ ...s, error: failed.error, loading: false }))
            return
        }
        setState({ data: Object.fromEntries(entries.map(([name], i) => [name, results[i]])), error: '', loading: false })
    }, [key])

    useEffect(() => {
        load()
        window.addEventListener(DATA_CHANGED, load)
        return () => window.removeEventListener(DATA_CHANGED, load)
    }, [load])

    return state
}
