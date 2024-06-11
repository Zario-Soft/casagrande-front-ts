import { Middleware } from 'redux'
import { RootState } from '../store'

export const LogMiddleware: Middleware<
    {}, // Most middleware do not modify the dispatch return value
    RootState
> = storeApi => next => action => {

    //console.log(storeApi.getState())

    return next(action);
}