import AuthReducer from "./auth.slice"

const userInfo = {
    login: 'user',
    fullname: 'User',
    is_admin: false,
    allowed_routes: ''
};

test('Unauthenticating user', () => {

    const result = AuthReducer({
        isAuthenticated: true,
        userInfo
    }, {
        type: 'auth/unauthenticate'
    })

    expect(result.isAuthenticated).toBe(false)
    expect(result.userInfo).toBe(null)
})

test('Authenticating user', () => {

    const result = AuthReducer({
        isAuthenticated: false,
        userInfo: null
    }, {
        type: 'auth/authenticate',
        payload: userInfo
    })

    expect(result.isAuthenticated).toBe(true)
    expect(result.userInfo).toEqual(userInfo)
})
