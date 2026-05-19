import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\AuthController::register
 * @see app/Http/Controllers/Api/AuthController.php:24
 * @route '/api/register'
 */
const register081b1c69c5c56495bfbc4baf15cc7ab2 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: register081b1c69c5c56495bfbc4baf15cc7ab2.url(options),
    method: 'post',
})

register081b1c69c5c56495bfbc4baf15cc7ab2.definition = {
    methods: ["post"],
    url: '/api/register',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AuthController::register
 * @see app/Http/Controllers/Api/AuthController.php:24
 * @route '/api/register'
 */
register081b1c69c5c56495bfbc4baf15cc7ab2.url = (options?: RouteQueryOptions) => {
    return register081b1c69c5c56495bfbc4baf15cc7ab2.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::register
 * @see app/Http/Controllers/Api/AuthController.php:24
 * @route '/api/register'
 */
register081b1c69c5c56495bfbc4baf15cc7ab2.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: register081b1c69c5c56495bfbc4baf15cc7ab2.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\AuthController::register
 * @see app/Http/Controllers/Api/AuthController.php:24
 * @route '/api/register'
 */
    const register081b1c69c5c56495bfbc4baf15cc7ab2Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: register081b1c69c5c56495bfbc4baf15cc7ab2.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\AuthController::register
 * @see app/Http/Controllers/Api/AuthController.php:24
 * @route '/api/register'
 */
        register081b1c69c5c56495bfbc4baf15cc7ab2Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: register081b1c69c5c56495bfbc4baf15cc7ab2.url(options),
            method: 'post',
        })
    
    register081b1c69c5c56495bfbc4baf15cc7ab2.form = register081b1c69c5c56495bfbc4baf15cc7ab2Form
    /**
* @see \App\Http\Controllers\Api\AuthController::register
 * @see app/Http/Controllers/Api/AuthController.php:24
 * @route '/api/mobile/register'
 */
const registerafffc0f25878b107133217b09dc8cf4d = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: registerafffc0f25878b107133217b09dc8cf4d.url(options),
    method: 'post',
})

registerafffc0f25878b107133217b09dc8cf4d.definition = {
    methods: ["post"],
    url: '/api/mobile/register',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AuthController::register
 * @see app/Http/Controllers/Api/AuthController.php:24
 * @route '/api/mobile/register'
 */
registerafffc0f25878b107133217b09dc8cf4d.url = (options?: RouteQueryOptions) => {
    return registerafffc0f25878b107133217b09dc8cf4d.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::register
 * @see app/Http/Controllers/Api/AuthController.php:24
 * @route '/api/mobile/register'
 */
registerafffc0f25878b107133217b09dc8cf4d.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: registerafffc0f25878b107133217b09dc8cf4d.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\AuthController::register
 * @see app/Http/Controllers/Api/AuthController.php:24
 * @route '/api/mobile/register'
 */
    const registerafffc0f25878b107133217b09dc8cf4dForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: registerafffc0f25878b107133217b09dc8cf4d.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\AuthController::register
 * @see app/Http/Controllers/Api/AuthController.php:24
 * @route '/api/mobile/register'
 */
        registerafffc0f25878b107133217b09dc8cf4dForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: registerafffc0f25878b107133217b09dc8cf4d.url(options),
            method: 'post',
        })
    
    registerafffc0f25878b107133217b09dc8cf4d.form = registerafffc0f25878b107133217b09dc8cf4dForm

export const register = {
    '/api/register': register081b1c69c5c56495bfbc4baf15cc7ab2,
    '/api/mobile/register': registerafffc0f25878b107133217b09dc8cf4d,
}

/**
* @see \App\Http\Controllers\Api\AuthController::login
 * @see app/Http/Controllers/Api/AuthController.php:89
 * @route '/api/login'
 */
const login864070da724d26d80017528ac19e2893 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: login864070da724d26d80017528ac19e2893.url(options),
    method: 'post',
})

login864070da724d26d80017528ac19e2893.definition = {
    methods: ["post"],
    url: '/api/login',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AuthController::login
 * @see app/Http/Controllers/Api/AuthController.php:89
 * @route '/api/login'
 */
login864070da724d26d80017528ac19e2893.url = (options?: RouteQueryOptions) => {
    return login864070da724d26d80017528ac19e2893.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::login
 * @see app/Http/Controllers/Api/AuthController.php:89
 * @route '/api/login'
 */
login864070da724d26d80017528ac19e2893.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: login864070da724d26d80017528ac19e2893.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\AuthController::login
 * @see app/Http/Controllers/Api/AuthController.php:89
 * @route '/api/login'
 */
    const login864070da724d26d80017528ac19e2893Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: login864070da724d26d80017528ac19e2893.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\AuthController::login
 * @see app/Http/Controllers/Api/AuthController.php:89
 * @route '/api/login'
 */
        login864070da724d26d80017528ac19e2893Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: login864070da724d26d80017528ac19e2893.url(options),
            method: 'post',
        })
    
    login864070da724d26d80017528ac19e2893.form = login864070da724d26d80017528ac19e2893Form
    /**
* @see \App\Http\Controllers\Api\AuthController::login
 * @see app/Http/Controllers/Api/AuthController.php:89
 * @route '/api/mobile/login'
 */
const login525ebd90b953f79e620438f7876c8ef0 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: login525ebd90b953f79e620438f7876c8ef0.url(options),
    method: 'post',
})

login525ebd90b953f79e620438f7876c8ef0.definition = {
    methods: ["post"],
    url: '/api/mobile/login',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AuthController::login
 * @see app/Http/Controllers/Api/AuthController.php:89
 * @route '/api/mobile/login'
 */
login525ebd90b953f79e620438f7876c8ef0.url = (options?: RouteQueryOptions) => {
    return login525ebd90b953f79e620438f7876c8ef0.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::login
 * @see app/Http/Controllers/Api/AuthController.php:89
 * @route '/api/mobile/login'
 */
login525ebd90b953f79e620438f7876c8ef0.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: login525ebd90b953f79e620438f7876c8ef0.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\AuthController::login
 * @see app/Http/Controllers/Api/AuthController.php:89
 * @route '/api/mobile/login'
 */
    const login525ebd90b953f79e620438f7876c8ef0Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: login525ebd90b953f79e620438f7876c8ef0.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\AuthController::login
 * @see app/Http/Controllers/Api/AuthController.php:89
 * @route '/api/mobile/login'
 */
        login525ebd90b953f79e620438f7876c8ef0Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: login525ebd90b953f79e620438f7876c8ef0.url(options),
            method: 'post',
        })
    
    login525ebd90b953f79e620438f7876c8ef0.form = login525ebd90b953f79e620438f7876c8ef0Form

export const login = {
    '/api/login': login864070da724d26d80017528ac19e2893,
    '/api/mobile/login': login525ebd90b953f79e620438f7876c8ef0,
}

/**
* @see \App\Http\Controllers\Api\AuthController::googleAuth
 * @see app/Http/Controllers/Api/AuthController.php:263
 * @route '/api/auth/google'
 */
export const googleAuth = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: googleAuth.url(options),
    method: 'post',
})

googleAuth.definition = {
    methods: ["post"],
    url: '/api/auth/google',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AuthController::googleAuth
 * @see app/Http/Controllers/Api/AuthController.php:263
 * @route '/api/auth/google'
 */
googleAuth.url = (options?: RouteQueryOptions) => {
    return googleAuth.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::googleAuth
 * @see app/Http/Controllers/Api/AuthController.php:263
 * @route '/api/auth/google'
 */
googleAuth.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: googleAuth.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\AuthController::googleAuth
 * @see app/Http/Controllers/Api/AuthController.php:263
 * @route '/api/auth/google'
 */
    const googleAuthForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: googleAuth.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\AuthController::googleAuth
 * @see app/Http/Controllers/Api/AuthController.php:263
 * @route '/api/auth/google'
 */
        googleAuthForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: googleAuth.url(options),
            method: 'post',
        })
    
    googleAuth.form = googleAuthForm
/**
* @see \App\Http\Controllers\Api\AuthController::forgotPassword
 * @see app/Http/Controllers/Api/AuthController.php:183
 * @route '/api/password/forgot'
 */
const forgotPassword7175061675479464a8a269d432d69a27 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: forgotPassword7175061675479464a8a269d432d69a27.url(options),
    method: 'post',
})

forgotPassword7175061675479464a8a269d432d69a27.definition = {
    methods: ["post"],
    url: '/api/password/forgot',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AuthController::forgotPassword
 * @see app/Http/Controllers/Api/AuthController.php:183
 * @route '/api/password/forgot'
 */
forgotPassword7175061675479464a8a269d432d69a27.url = (options?: RouteQueryOptions) => {
    return forgotPassword7175061675479464a8a269d432d69a27.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::forgotPassword
 * @see app/Http/Controllers/Api/AuthController.php:183
 * @route '/api/password/forgot'
 */
forgotPassword7175061675479464a8a269d432d69a27.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: forgotPassword7175061675479464a8a269d432d69a27.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\AuthController::forgotPassword
 * @see app/Http/Controllers/Api/AuthController.php:183
 * @route '/api/password/forgot'
 */
    const forgotPassword7175061675479464a8a269d432d69a27Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: forgotPassword7175061675479464a8a269d432d69a27.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\AuthController::forgotPassword
 * @see app/Http/Controllers/Api/AuthController.php:183
 * @route '/api/password/forgot'
 */
        forgotPassword7175061675479464a8a269d432d69a27Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: forgotPassword7175061675479464a8a269d432d69a27.url(options),
            method: 'post',
        })
    
    forgotPassword7175061675479464a8a269d432d69a27.form = forgotPassword7175061675479464a8a269d432d69a27Form
    /**
* @see \App\Http\Controllers\Api\AuthController::forgotPassword
 * @see app/Http/Controllers/Api/AuthController.php:183
 * @route '/api/mobile/password/forgot'
 */
const forgotPasswordf14afb2c14a03869b9fb145be5191bb1 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: forgotPasswordf14afb2c14a03869b9fb145be5191bb1.url(options),
    method: 'post',
})

forgotPasswordf14afb2c14a03869b9fb145be5191bb1.definition = {
    methods: ["post"],
    url: '/api/mobile/password/forgot',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AuthController::forgotPassword
 * @see app/Http/Controllers/Api/AuthController.php:183
 * @route '/api/mobile/password/forgot'
 */
forgotPasswordf14afb2c14a03869b9fb145be5191bb1.url = (options?: RouteQueryOptions) => {
    return forgotPasswordf14afb2c14a03869b9fb145be5191bb1.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::forgotPassword
 * @see app/Http/Controllers/Api/AuthController.php:183
 * @route '/api/mobile/password/forgot'
 */
forgotPasswordf14afb2c14a03869b9fb145be5191bb1.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: forgotPasswordf14afb2c14a03869b9fb145be5191bb1.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\AuthController::forgotPassword
 * @see app/Http/Controllers/Api/AuthController.php:183
 * @route '/api/mobile/password/forgot'
 */
    const forgotPasswordf14afb2c14a03869b9fb145be5191bb1Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: forgotPasswordf14afb2c14a03869b9fb145be5191bb1.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\AuthController::forgotPassword
 * @see app/Http/Controllers/Api/AuthController.php:183
 * @route '/api/mobile/password/forgot'
 */
        forgotPasswordf14afb2c14a03869b9fb145be5191bb1Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: forgotPasswordf14afb2c14a03869b9fb145be5191bb1.url(options),
            method: 'post',
        })
    
    forgotPasswordf14afb2c14a03869b9fb145be5191bb1.form = forgotPasswordf14afb2c14a03869b9fb145be5191bb1Form

export const forgotPassword = {
    '/api/password/forgot': forgotPassword7175061675479464a8a269d432d69a27,
    '/api/mobile/password/forgot': forgotPasswordf14afb2c14a03869b9fb145be5191bb1,
}

/**
* @see \App\Http\Controllers\Api\AuthController::resetPassword
 * @see app/Http/Controllers/Api/AuthController.php:216
 * @route '/api/password/reset'
 */
const resetPassword2a3e81395a532e6ae72c36c026f6b2bc = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resetPassword2a3e81395a532e6ae72c36c026f6b2bc.url(options),
    method: 'post',
})

resetPassword2a3e81395a532e6ae72c36c026f6b2bc.definition = {
    methods: ["post"],
    url: '/api/password/reset',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AuthController::resetPassword
 * @see app/Http/Controllers/Api/AuthController.php:216
 * @route '/api/password/reset'
 */
resetPassword2a3e81395a532e6ae72c36c026f6b2bc.url = (options?: RouteQueryOptions) => {
    return resetPassword2a3e81395a532e6ae72c36c026f6b2bc.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::resetPassword
 * @see app/Http/Controllers/Api/AuthController.php:216
 * @route '/api/password/reset'
 */
resetPassword2a3e81395a532e6ae72c36c026f6b2bc.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resetPassword2a3e81395a532e6ae72c36c026f6b2bc.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\AuthController::resetPassword
 * @see app/Http/Controllers/Api/AuthController.php:216
 * @route '/api/password/reset'
 */
    const resetPassword2a3e81395a532e6ae72c36c026f6b2bcForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: resetPassword2a3e81395a532e6ae72c36c026f6b2bc.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\AuthController::resetPassword
 * @see app/Http/Controllers/Api/AuthController.php:216
 * @route '/api/password/reset'
 */
        resetPassword2a3e81395a532e6ae72c36c026f6b2bcForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: resetPassword2a3e81395a532e6ae72c36c026f6b2bc.url(options),
            method: 'post',
        })
    
    resetPassword2a3e81395a532e6ae72c36c026f6b2bc.form = resetPassword2a3e81395a532e6ae72c36c026f6b2bcForm
    /**
* @see \App\Http\Controllers\Api\AuthController::resetPassword
 * @see app/Http/Controllers/Api/AuthController.php:216
 * @route '/api/mobile/password/reset'
 */
const resetPassword2bd6b7316a43fbda222e0bbde4af96b4 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resetPassword2bd6b7316a43fbda222e0bbde4af96b4.url(options),
    method: 'post',
})

resetPassword2bd6b7316a43fbda222e0bbde4af96b4.definition = {
    methods: ["post"],
    url: '/api/mobile/password/reset',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AuthController::resetPassword
 * @see app/Http/Controllers/Api/AuthController.php:216
 * @route '/api/mobile/password/reset'
 */
resetPassword2bd6b7316a43fbda222e0bbde4af96b4.url = (options?: RouteQueryOptions) => {
    return resetPassword2bd6b7316a43fbda222e0bbde4af96b4.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::resetPassword
 * @see app/Http/Controllers/Api/AuthController.php:216
 * @route '/api/mobile/password/reset'
 */
resetPassword2bd6b7316a43fbda222e0bbde4af96b4.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: resetPassword2bd6b7316a43fbda222e0bbde4af96b4.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\AuthController::resetPassword
 * @see app/Http/Controllers/Api/AuthController.php:216
 * @route '/api/mobile/password/reset'
 */
    const resetPassword2bd6b7316a43fbda222e0bbde4af96b4Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: resetPassword2bd6b7316a43fbda222e0bbde4af96b4.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\AuthController::resetPassword
 * @see app/Http/Controllers/Api/AuthController.php:216
 * @route '/api/mobile/password/reset'
 */
        resetPassword2bd6b7316a43fbda222e0bbde4af96b4Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: resetPassword2bd6b7316a43fbda222e0bbde4af96b4.url(options),
            method: 'post',
        })
    
    resetPassword2bd6b7316a43fbda222e0bbde4af96b4.form = resetPassword2bd6b7316a43fbda222e0bbde4af96b4Form

export const resetPassword = {
    '/api/password/reset': resetPassword2a3e81395a532e6ae72c36c026f6b2bc,
    '/api/mobile/password/reset': resetPassword2bd6b7316a43fbda222e0bbde4af96b4,
}

/**
* @see \App\Http\Controllers\Api\AuthController::logout
 * @see app/Http/Controllers/Api/AuthController.php:142
 * @route '/api/logout'
 */
export const logout = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

logout.definition = {
    methods: ["post"],
    url: '/api/logout',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AuthController::logout
 * @see app/Http/Controllers/Api/AuthController.php:142
 * @route '/api/logout'
 */
logout.url = (options?: RouteQueryOptions) => {
    return logout.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::logout
 * @see app/Http/Controllers/Api/AuthController.php:142
 * @route '/api/logout'
 */
logout.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\AuthController::logout
 * @see app/Http/Controllers/Api/AuthController.php:142
 * @route '/api/logout'
 */
    const logoutForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: logout.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\AuthController::logout
 * @see app/Http/Controllers/Api/AuthController.php:142
 * @route '/api/logout'
 */
        logoutForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: logout.url(options),
            method: 'post',
        })
    
    logout.form = logoutForm
/**
* @see \App\Http\Controllers\Api\AuthController::revokeAllTokens
 * @see app/Http/Controllers/Api/AuthController.php:167
 * @route '/api/revoke-all-tokens'
 */
export const revokeAllTokens = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: revokeAllTokens.url(options),
    method: 'post',
})

revokeAllTokens.definition = {
    methods: ["post"],
    url: '/api/revoke-all-tokens',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AuthController::revokeAllTokens
 * @see app/Http/Controllers/Api/AuthController.php:167
 * @route '/api/revoke-all-tokens'
 */
revokeAllTokens.url = (options?: RouteQueryOptions) => {
    return revokeAllTokens.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::revokeAllTokens
 * @see app/Http/Controllers/Api/AuthController.php:167
 * @route '/api/revoke-all-tokens'
 */
revokeAllTokens.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: revokeAllTokens.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\AuthController::revokeAllTokens
 * @see app/Http/Controllers/Api/AuthController.php:167
 * @route '/api/revoke-all-tokens'
 */
    const revokeAllTokensForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: revokeAllTokens.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\AuthController::revokeAllTokens
 * @see app/Http/Controllers/Api/AuthController.php:167
 * @route '/api/revoke-all-tokens'
 */
        revokeAllTokensForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: revokeAllTokens.url(options),
            method: 'post',
        })
    
    revokeAllTokens.form = revokeAllTokensForm
const AuthController = { register, login, googleAuth, forgotPassword, resetPassword, logout, revokeAllTokens }

export default AuthController