import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\ShuttleLocationController::index
 * @see app/Http/Controllers/Api/ShuttleLocationController.php:11
 * @route '/api/shuttle-locations'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/shuttle-locations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ShuttleLocationController::index
 * @see app/Http/Controllers/Api/ShuttleLocationController.php:11
 * @route '/api/shuttle-locations'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ShuttleLocationController::index
 * @see app/Http/Controllers/Api/ShuttleLocationController.php:11
 * @route '/api/shuttle-locations'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\ShuttleLocationController::index
 * @see app/Http/Controllers/Api/ShuttleLocationController.php:11
 * @route '/api/shuttle-locations'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\ShuttleLocationController::store
 * @see app/Http/Controllers/Api/ShuttleLocationController.php:16
 * @route '/api/shuttle-locations'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/shuttle-locations',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\ShuttleLocationController::store
 * @see app/Http/Controllers/Api/ShuttleLocationController.php:16
 * @route '/api/shuttle-locations'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ShuttleLocationController::store
 * @see app/Http/Controllers/Api/ShuttleLocationController.php:16
 * @route '/api/shuttle-locations'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ShuttleLocationController::show
 * @see app/Http/Controllers/Api/ShuttleLocationController.php:29
 * @route '/api/shuttle-locations/{shuttle_location}'
 */
export const show = (args: { shuttle_location: string | number } | [shuttle_location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/shuttle-locations/{shuttle_location}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ShuttleLocationController::show
 * @see app/Http/Controllers/Api/ShuttleLocationController.php:29
 * @route '/api/shuttle-locations/{shuttle_location}'
 */
show.url = (args: { shuttle_location: string | number } | [shuttle_location: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { shuttle_location: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    shuttle_location: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        shuttle_location: args.shuttle_location,
                }

    return show.definition.url
            .replace('{shuttle_location}', parsedArgs.shuttle_location.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ShuttleLocationController::show
 * @see app/Http/Controllers/Api/ShuttleLocationController.php:29
 * @route '/api/shuttle-locations/{shuttle_location}'
 */
show.get = (args: { shuttle_location: string | number } | [shuttle_location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\ShuttleLocationController::show
 * @see app/Http/Controllers/Api/ShuttleLocationController.php:29
 * @route '/api/shuttle-locations/{shuttle_location}'
 */
show.head = (args: { shuttle_location: string | number } | [shuttle_location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\ShuttleLocationController::update
 * @see app/Http/Controllers/Api/ShuttleLocationController.php:34
 * @route '/api/shuttle-locations/{shuttle_location}'
 */
export const update = (args: { shuttle_location: string | number } | [shuttle_location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/shuttle-locations/{shuttle_location}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Api\ShuttleLocationController::update
 * @see app/Http/Controllers/Api/ShuttleLocationController.php:34
 * @route '/api/shuttle-locations/{shuttle_location}'
 */
update.url = (args: { shuttle_location: string | number } | [shuttle_location: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { shuttle_location: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    shuttle_location: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        shuttle_location: args.shuttle_location,
                }

    return update.definition.url
            .replace('{shuttle_location}', parsedArgs.shuttle_location.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ShuttleLocationController::update
 * @see app/Http/Controllers/Api/ShuttleLocationController.php:34
 * @route '/api/shuttle-locations/{shuttle_location}'
 */
update.put = (args: { shuttle_location: string | number } | [shuttle_location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Api\ShuttleLocationController::update
 * @see app/Http/Controllers/Api/ShuttleLocationController.php:34
 * @route '/api/shuttle-locations/{shuttle_location}'
 */
update.patch = (args: { shuttle_location: string | number } | [shuttle_location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Api\ShuttleLocationController::destroy
 * @see app/Http/Controllers/Api/ShuttleLocationController.php:46
 * @route '/api/shuttle-locations/{shuttle_location}'
 */
export const destroy = (args: { shuttle_location: string | number } | [shuttle_location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/shuttle-locations/{shuttle_location}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\ShuttleLocationController::destroy
 * @see app/Http/Controllers/Api/ShuttleLocationController.php:46
 * @route '/api/shuttle-locations/{shuttle_location}'
 */
destroy.url = (args: { shuttle_location: string | number } | [shuttle_location: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { shuttle_location: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    shuttle_location: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        shuttle_location: args.shuttle_location,
                }

    return destroy.definition.url
            .replace('{shuttle_location}', parsedArgs.shuttle_location.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ShuttleLocationController::destroy
 * @see app/Http/Controllers/Api/ShuttleLocationController.php:46
 * @route '/api/shuttle-locations/{shuttle_location}'
 */
destroy.delete = (args: { shuttle_location: string | number } | [shuttle_location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})
const ShuttleLocationController = { index, store, show, update, destroy }

export default ShuttleLocationController