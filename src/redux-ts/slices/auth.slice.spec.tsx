import AuthReducer from "./auth.slice"
import AuthActions from "./auth.slice"

const tokenValue = 'some.token';

test('Unauthenticating user', () => {
    
    const result = AuthReducer({
        token: tokenValue
    }, {
        type: 'AuthActions.Unauthenticated'
    })

    expect(result.token).toBe('')
})

test('Authenticating user', () => {
    
    const result = AuthReducer({
        token: ''
    }, {
        type: 'AuthActions.Authenticated',
        payload: {
            token: tokenValue
        }        
    })

    expect(result.token).toBe(tokenValue)
})