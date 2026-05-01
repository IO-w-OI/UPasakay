import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Api\StopController::index
 * @see app/Http/Controllers/Api/StopController.php:13
 * @route '/api/stops'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/stops',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\StopController::index
 * @see app/Http/Controllers/Api/StopController.php:13
 * @route '/api/stops'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\StopController::index
 * @see app/Http/Controllers/Api/StopController.php:13
 * @route '/api/stops'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\StopController::index
 * @see app/Http/Controllers/Api/StopController.php:13
 * @route '/api/stops'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\StopController::store
 * @see app/Http/Controllers/Api/StopController.php:25
 * @route '/api/stops'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/stops',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\StopController::store
 * @see app/Http/Controllers/Api/StopController.php:25
 * @route '/api/stops'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\StopController::store
 * @see app/Http/Controllers/Api/StopController.php:25
 * @route '/api/stops'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\StopController::show
 * @see app/Http/Controllers/Api/StopController.php:48
 * @route '/api/stops/{stop}'
 */
export const show = (args: { stop: number | { id: number } } | [stop: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/stops/{stop}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\StopController::show
 * @see app/Http/Controllers/Api/StopController.php:48
 * @route '/api/stops/{stop}'
 */
show.url = (args: { stop: number | { id: number } } | [stop: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { stop: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { stop: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    stop: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        stop: typeof args.stop === 'object'
                ? args.stop.id
                : args.stop,
                }

    return show.definition.url
            .replace('{stop}', parsedArgs.stop.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\StopController::show
 * @see app/Http/Controllers/Api/StopController.php:48
 * @route '/api/stops/{stop}'
 */
show.get = (args: { stop: number | { id: number } } | [stop: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\StopController::show
 * @see app/Http/Controllers/Api/StopController.php:48
 * @route '/api/stops/{stop}'
 */
show.head = (args: { stop: number | { id: number } } | [stop: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\StopController::update
 * @see app/Http/Controllers/Api/StopController.php:53
 * @route '/api/stops/{stop}'
 */
export const update = (args: { stop: number | { id: number } } | [stop: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/stops/{stop}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Api\StopController::update
 * @see app/Http/Controllers/Api/StopController.php:53
 * @route '/api/stops/{stop}'
 */
update.url = (args: { stop: number | { id: number } } | [stop: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { stop: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { stop: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    stop: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        stop: typeof args.stop === 'object'
                ? args.stop.id
                : args.stop,
                }

    return update.definition.url
            .replace('{stop}', parsedArgs.stop.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\StopController::update
 * @see app/Http/Controllers/Api/StopController.php:53
 * @route '/api/stops/{stop}'
 */
update.put = (args: { stop: number | { id: number } } | [stop: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Api\StopController::update
 * @see app/Http/Controllers/Api/StopController.php:53
 * @route '/api/stops/{stop}'
 */
update.patch = (args: { stop: number | { id: number } } | [stop: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Api\StopController::destroy
 * @see app/Http/Controllers/Api/StopController.php:77
 * @route '/api/stops/{stop}'
 */
export const destroy = (args: { stop: number | { id: number } } | [stop: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/stops/{stop}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\StopController::destroy
 * @see app/Http/Controllers/Api/StopController.php:77
 * @route '/api/stops/{stop}'
 */
destroy.url = (args: { stop: number | { id: number } } | [stop: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { stop: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { stop: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    stop: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        stop: typeof args.stop === 'object'
                ? args.stop.id
                : args.stop,
                }

    return destroy.definition.url
            .replace('{stop}', parsedArgs.stop.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\StopController::destroy
 * @see app/Http/Controllers/Api/StopController.php:77
 * @route '/api/stops/{stop}'
 */
destroy.delete = (args: { stop: number | { id: number } } | [stop: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})
const stops = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
show: Object.assign(show, show),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default stops