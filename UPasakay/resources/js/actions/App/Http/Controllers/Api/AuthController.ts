import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\AuthController::register
 * @see app/Http/Controllers/Api/AuthController.php:18
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
 * @see app/Http/Controllers/Api/AuthController.php:18
 * @route '/api/register'
 */
register081b1c69c5c56495bfbc4baf15cc7ab2.url = (options?: RouteQueryOptions) => {
    return register081b1c69c5c56495bfbc4baf15cc7ab2.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::register
 * @see app/Http/Controllers/Api/AuthController.php:18
 * @route '/api/register'
 */
register081b1c69c5c56495bfbc4baf15cc7ab2.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: register081b1c69c5c56495bfbc4baf15cc7ab2.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\AuthController::register
 * @see app/Http/Controllers/Api/AuthController.php:18
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
 * @see app/Http/Controllers/Api/AuthController.php:18
 * @route '/api/mobile/register'
 */
registerafffc0f25878b107133217b09dc8cf4d.url = (options?: RouteQueryOptions) => {
    return registerafffc0f25878b107133217b09dc8cf4d.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::register
 * @see app/Http/Controllers/Api/AuthController.php:18
 * @route '/api/mobile/register'
 */
registerafffc0f25878b107133217b09dc8cf4d.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: registerafffc0f25878b107133217b09dc8cf4d.url(options),
    method: 'post',
})

export const register = {
    '/api/register': register081b1c69c5c56495bfbc4baf15cc7ab2,
    '/api/mobile/register': registerafffc0f25878b107133217b09dc8cf4d,
}

/**
* @see \App\Http\Controllers\Api\AuthController::login
 * @see app/Http/Controllers/Api/AuthController.php:73
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
 * @see app/Http/Controllers/Api/AuthController.php:73
 * @route '/api/login'
 */
login864070da724d26d80017528ac19e2893.url = (options?: RouteQueryOptions) => {
    return login864070da724d26d80017528ac19e2893.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::login
 * @see app/Http/Controllers/Api/AuthController.php:73
 * @route '/api/login'
 */
login864070da724d26d80017528ac19e2893.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: login864070da724d26d80017528ac19e2893.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\AuthController::login
 * @see app/Http/Controllers/Api/AuthController.php:73
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
 * @see app/Http/Controllers/Api/AuthController.php:73
 * @route '/api/mobile/login'
 */
login525ebd90b953f79e620438f7876c8ef0.url = (options?: RouteQueryOptions) => {
    return login525ebd90b953f79e620438f7876c8ef0.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::login
 * @see app/Http/Controllers/Api/AuthController.php:73
 * @route '/api/mobile/login'
 */
login525ebd90b953f79e620438f7876c8ef0.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: login525ebd90b953f79e620438f7876c8ef0.url(options),
    method: 'post',
})

export const login = {
    '/api/login': login864070da724d26d80017528ac19e2893,
    '/api/mobile/login': login525ebd90b953f79e620438f7876c8ef0,
}

/**
* @see \App\Http\Controllers\Api\AuthController::logout
 * @see app/Http/Controllers/Api/AuthController.php:129
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
 * @see app/Http/Controllers/Api/AuthController.php:129
 * @route '/api/logout'
 */
logout.url = (options?: RouteQueryOptions) => {
    return logout.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::logout
 * @see app/Http/Controllers/Api/AuthController.php:129
 * @route '/api/logout'
 */
logout.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\AuthController::revokeAllTokens
 * @see app/Http/Controllers/Api/AuthController.php:140
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
 * @see app/Http/Controllers/Api/AuthController.php:140
 * @route '/api/revoke-all-tokens'
 */
revokeAllTokens.url = (options?: RouteQueryOptions) => {
    return revokeAllTokens.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::revokeAllTokens
 * @see app/Http/Controllers/Api/AuthController.php:140
 * @route '/api/revoke-all-tokens'
 */
revokeAllTokens.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: revokeAllTokens.url(options),
    method: 'post',
})
const AuthController = { register, login, logout, revokeAllTokens }

export default AuthController