import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\ShuttleController::index
 * @see app/Http/Controllers/Api/ShuttleController.php:11
 * @route '/api/shuttles'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/shuttles',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ShuttleController::index
 * @see app/Http/Controllers/Api/ShuttleController.php:11
 * @route '/api/shuttles'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ShuttleController::index
 * @see app/Http/Controllers/Api/ShuttleController.php:11
 * @route '/api/shuttles'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\ShuttleController::index
 * @see app/Http/Controllers/Api/ShuttleController.php:11
 * @route '/api/shuttles'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\ShuttleController::store
 * @see app/Http/Controllers/Api/ShuttleController.php:16
 * @route '/api/shuttles'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/shuttles',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\ShuttleController::store
 * @see app/Http/Controllers/Api/ShuttleController.php:16
 * @route '/api/shuttles'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ShuttleController::store
 * @see app/Http/Controllers/Api/ShuttleController.php:16
 * @route '/api/shuttles'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ShuttleController::show
 * @see app/Http/Controllers/Api/ShuttleController.php:28
 * @route '/api/shuttles/{shuttle}'
 */
export const show = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/shuttles/{shuttle}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ShuttleController::show
 * @see app/Http/Controllers/Api/ShuttleController.php:28
 * @route '/api/shuttles/{shuttle}'
 */
show.url = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { shuttle: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { shuttle: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    shuttle: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        shuttle: typeof args.shuttle === 'object'
                ? args.shuttle.id
                : args.shuttle,
                }

    return show.definition.url
            .replace('{shuttle}', parsedArgs.shuttle.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ShuttleController::show
 * @see app/Http/Controllers/Api/ShuttleController.php:28
 * @route '/api/shuttles/{shuttle}'
 */
show.get = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\ShuttleController::show
 * @see app/Http/Controllers/Api/ShuttleController.php:28
 * @route '/api/shuttles/{shuttle}'
 */
show.head = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\ShuttleController::update
 * @see app/Http/Controllers/Api/ShuttleController.php:33
 * @route '/api/shuttles/{shuttle}'
 */
export const update = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/shuttles/{shuttle}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Api\ShuttleController::update
 * @see app/Http/Controllers/Api/ShuttleController.php:33
 * @route '/api/shuttles/{shuttle}'
 */
update.url = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { shuttle: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { shuttle: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    shuttle: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        shuttle: typeof args.shuttle === 'object'
                ? args.shuttle.id
                : args.shuttle,
                }

    return update.definition.url
            .replace('{shuttle}', parsedArgs.shuttle.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ShuttleController::update
 * @see app/Http/Controllers/Api/ShuttleController.php:33
 * @route '/api/shuttles/{shuttle}'
 */
update.put = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Api\ShuttleController::update
 * @see app/Http/Controllers/Api/ShuttleController.php:33
 * @route '/api/shuttles/{shuttle}'
 */
update.patch = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Api\ShuttleController::destroy
 * @see app/Http/Controllers/Api/ShuttleController.php:45
 * @route '/api/shuttles/{shuttle}'
 */
export const destroy = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/shuttles/{shuttle}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\ShuttleController::destroy
 * @see app/Http/Controllers/Api/ShuttleController.php:45
 * @route '/api/shuttles/{shuttle}'
 */
destroy.url = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { shuttle: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { shuttle: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    shuttle: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        shuttle: typeof args.shuttle === 'object'
                ? args.shuttle.id
                : args.shuttle,
                }

    return destroy.definition.url
            .replace('{shuttle}', parsedArgs.shuttle.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ShuttleController::destroy
 * @see app/Http/Controllers/Api/ShuttleController.php:45
 * @route '/api/shuttles/{shuttle}'
 */
destroy.delete = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})
const ShuttleController = { index, store, show, update, destroy }

export default ShuttleController