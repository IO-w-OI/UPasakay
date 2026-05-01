import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\DriverController::index
 * @see app/Http/Controllers/DriverController.php:17
 * @route '/drivers'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/drivers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DriverController::index
 * @see app/Http/Controllers/DriverController.php:17
 * @route '/drivers'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DriverController::index
 * @see app/Http/Controllers/DriverController.php:17
 * @route '/drivers'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DriverController::index
 * @see app/Http/Controllers/DriverController.php:17
 * @route '/drivers'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\DriverController::show
 * @see app/Http/Controllers/DriverController.php:128
 * @route '/drivers/{driver}'
 */
export const show = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/drivers/{driver}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DriverController::show
 * @see app/Http/Controllers/DriverController.php:128
 * @route '/drivers/{driver}'
 */
show.url = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { driver: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { driver: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    driver: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        driver: typeof args.driver === 'object'
                ? args.driver.id
                : args.driver,
                }

    return show.definition.url
            .replace('{driver}', parsedArgs.driver.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DriverController::show
 * @see app/Http/Controllers/DriverController.php:128
 * @route '/drivers/{driver}'
 */
show.get = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\DriverController::show
 * @see app/Http/Controllers/DriverController.php:128
 * @route '/drivers/{driver}'
 */
show.head = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\DriverController::store
 * @see app/Http/Controllers/DriverController.php:182
 * @route '/drivers'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/drivers',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DriverController::store
 * @see app/Http/Controllers/DriverController.php:182
 * @route '/drivers'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DriverController::store
 * @see app/Http/Controllers/DriverController.php:182
 * @route '/drivers'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DriverController::update
 * @see app/Http/Controllers/DriverController.php:216
 * @route '/drivers/{driver}'
 */
export const update = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/drivers/{driver}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\DriverController::update
 * @see app/Http/Controllers/DriverController.php:216
 * @route '/drivers/{driver}'
 */
update.url = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { driver: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { driver: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    driver: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        driver: typeof args.driver === 'object'
                ? args.driver.id
                : args.driver,
                }

    return update.definition.url
            .replace('{driver}', parsedArgs.driver.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DriverController::update
 * @see app/Http/Controllers/DriverController.php:216
 * @route '/drivers/{driver}'
 */
update.patch = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\DriverController::resetPassword
 * @see app/Http/Controllers/DriverController.php:254
 * @route '/drivers/{driver}/reset-password'
 */
export const resetPassword = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: resetPassword.url(args, options),
    method: 'patch',
})

resetPassword.definition = {
    methods: ["patch"],
    url: '/drivers/{driver}/reset-password',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\DriverController::resetPassword
 * @see app/Http/Controllers/DriverController.php:254
 * @route '/drivers/{driver}/reset-password'
 */
resetPassword.url = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { driver: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { driver: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    driver: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        driver: typeof args.driver === 'object'
                ? args.driver.id
                : args.driver,
                }

    return resetPassword.definition.url
            .replace('{driver}', parsedArgs.driver.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DriverController::resetPassword
 * @see app/Http/Controllers/DriverController.php:254
 * @route '/drivers/{driver}/reset-password'
 */
resetPassword.patch = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: resetPassword.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\DriverController::destroy
 * @see app/Http/Controllers/DriverController.php:267
 * @route '/drivers/{driver}'
 */
export const destroy = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/drivers/{driver}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\DriverController::destroy
 * @see app/Http/Controllers/DriverController.php:267
 * @route '/drivers/{driver}'
 */
destroy.url = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { driver: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { driver: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    driver: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        driver: typeof args.driver === 'object'
                ? args.driver.id
                : args.driver,
                }

    return destroy.definition.url
            .replace('{driver}', parsedArgs.driver.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DriverController::destroy
 * @see app/Http/Controllers/DriverController.php:267
 * @route '/drivers/{driver}'
 */
destroy.delete = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})
const DriverController = { index, show, store, update, resetPassword, destroy }

export default DriverController