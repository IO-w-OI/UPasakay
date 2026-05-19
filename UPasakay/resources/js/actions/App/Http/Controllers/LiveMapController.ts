import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\LiveMapController::index
 * @see app/Http/Controllers/LiveMapController.php:16
 * @route '/live-map'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/live-map',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\LiveMapController::index
 * @see app/Http/Controllers/LiveMapController.php:16
 * @route '/live-map'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\LiveMapController::index
 * @see app/Http/Controllers/LiveMapController.php:16
 * @route '/live-map'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\LiveMapController::index
 * @see app/Http/Controllers/LiveMapController.php:16
 * @route '/live-map'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\LiveMapController::index
 * @see app/Http/Controllers/LiveMapController.php:16
 * @route '/live-map'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\LiveMapController::index
 * @see app/Http/Controllers/LiveMapController.php:16
 * @route '/live-map'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\LiveMapController::index
 * @see app/Http/Controllers/LiveMapController.php:16
 * @route '/live-map'
 */
        indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \App\Http\Controllers\LiveMapController::store
 * @see app/Http/Controllers/LiveMapController.php:117
 * @route '/live-map/stops'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/live-map/stops',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\LiveMapController::store
 * @see app/Http/Controllers/LiveMapController.php:117
 * @route '/live-map/stops'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\LiveMapController::store
 * @see app/Http/Controllers/LiveMapController.php:117
 * @route '/live-map/stops'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\LiveMapController::store
 * @see app/Http/Controllers/LiveMapController.php:117
 * @route '/live-map/stops'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LiveMapController::store
 * @see app/Http/Controllers/LiveMapController.php:117
 * @route '/live-map/stops'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\LiveMapController::update
 * @see app/Http/Controllers/LiveMapController.php:141
 * @route '/live-map/stops/{stop}'
 */
export const update = (args: { stop: number | { id: number } } | [stop: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/live-map/stops/{stop}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\LiveMapController::update
 * @see app/Http/Controllers/LiveMapController.php:141
 * @route '/live-map/stops/{stop}'
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
* @see \App\Http\Controllers\LiveMapController::update
 * @see app/Http/Controllers/LiveMapController.php:141
 * @route '/live-map/stops/{stop}'
 */
update.patch = (args: { stop: number | { id: number } } | [stop: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\LiveMapController::update
 * @see app/Http/Controllers/LiveMapController.php:141
 * @route '/live-map/stops/{stop}'
 */
    const updateForm = (args: { stop: number | { id: number } } | [stop: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LiveMapController::update
 * @see app/Http/Controllers/LiveMapController.php:141
 * @route '/live-map/stops/{stop}'
 */
        updateForm.patch = (args: { stop: number | { id: number } } | [stop: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \App\Http\Controllers\LiveMapController::destroy
 * @see app/Http/Controllers/LiveMapController.php:152
 * @route '/live-map/stops/{stop}'
 */
export const destroy = (args: { stop: number | { id: number } } | [stop: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/live-map/stops/{stop}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\LiveMapController::destroy
 * @see app/Http/Controllers/LiveMapController.php:152
 * @route '/live-map/stops/{stop}'
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
* @see \App\Http\Controllers\LiveMapController::destroy
 * @see app/Http/Controllers/LiveMapController.php:152
 * @route '/live-map/stops/{stop}'
 */
destroy.delete = (args: { stop: number | { id: number } } | [stop: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\LiveMapController::destroy
 * @see app/Http/Controllers/LiveMapController.php:152
 * @route '/live-map/stops/{stop}'
 */
    const destroyForm = (args: { stop: number | { id: number } } | [stop: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LiveMapController::destroy
 * @see app/Http/Controllers/LiveMapController.php:152
 * @route '/live-map/stops/{stop}'
 */
        destroyForm.delete = (args: { stop: number | { id: number } } | [stop: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const LiveMapController = { index, store, update, destroy }

export default LiveMapController