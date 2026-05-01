import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Api\PickupRequestController::index
 * @see app/Http/Controllers/Api/PickupRequestController.php:20
 * @route '/api/pickup-requests'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/pickup-requests',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PickupRequestController::index
 * @see app/Http/Controllers/Api/PickupRequestController.php:20
 * @route '/api/pickup-requests'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PickupRequestController::index
 * @see app/Http/Controllers/Api/PickupRequestController.php:20
 * @route '/api/pickup-requests'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\PickupRequestController::index
 * @see app/Http/Controllers/Api/PickupRequestController.php:20
 * @route '/api/pickup-requests'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PickupRequestController::index
 * @see app/Http/Controllers/PickupRequestController.php:16
 * @route '/pickup-requests'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/pickup-requests',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PickupRequestController::index
 * @see app/Http/Controllers/PickupRequestController.php:16
 * @route '/pickup-requests'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PickupRequestController::index
 * @see app/Http/Controllers/PickupRequestController.php:16
 * @route '/pickup-requests'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PickupRequestController::index
 * @see app/Http/Controllers/PickupRequestController.php:16
 * @route '/pickup-requests'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\PickupRequestController::store
 * @see app/Http/Controllers/Api/PickupRequestController.php:27
 * @route '/api/pickup-requests'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/pickup-requests',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\PickupRequestController::store
 * @see app/Http/Controllers/Api/PickupRequestController.php:27
 * @route '/api/pickup-requests'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PickupRequestController::store
 * @see app/Http/Controllers/Api/PickupRequestController.php:27
 * @route '/api/pickup-requests'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PickupRequestController::show
 * @see app/Http/Controllers/Api/PickupRequestController.php:57
 * @route '/api/pickup-requests/{pickup_request}'
 */
export const show = (args: { pickup_request: string | number } | [pickup_request: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/pickup-requests/{pickup_request}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PickupRequestController::show
 * @see app/Http/Controllers/Api/PickupRequestController.php:57
 * @route '/api/pickup-requests/{pickup_request}'
 */
show.url = (args: { pickup_request: string | number } | [pickup_request: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { pickup_request: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    pickup_request: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        pickup_request: args.pickup_request,
                }

    return show.definition.url
            .replace('{pickup_request}', parsedArgs.pickup_request.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PickupRequestController::show
 * @see app/Http/Controllers/Api/PickupRequestController.php:57
 * @route '/api/pickup-requests/{pickup_request}'
 */
show.get = (args: { pickup_request: string | number } | [pickup_request: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\PickupRequestController::show
 * @see app/Http/Controllers/Api/PickupRequestController.php:57
 * @route '/api/pickup-requests/{pickup_request}'
 */
show.head = (args: { pickup_request: string | number } | [pickup_request: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\PickupRequestController::update
 * @see app/Http/Controllers/Api/PickupRequestController.php:64
 * @route '/api/pickup-requests/{pickup_request}'
 */
export const update = (args: { pickup_request: string | number } | [pickup_request: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/pickup-requests/{pickup_request}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Api\PickupRequestController::update
 * @see app/Http/Controllers/Api/PickupRequestController.php:64
 * @route '/api/pickup-requests/{pickup_request}'
 */
update.url = (args: { pickup_request: string | number } | [pickup_request: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { pickup_request: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    pickup_request: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        pickup_request: args.pickup_request,
                }

    return update.definition.url
            .replace('{pickup_request}', parsedArgs.pickup_request.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PickupRequestController::update
 * @see app/Http/Controllers/Api/PickupRequestController.php:64
 * @route '/api/pickup-requests/{pickup_request}'
 */
update.put = (args: { pickup_request: string | number } | [pickup_request: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Api\PickupRequestController::update
 * @see app/Http/Controllers/Api/PickupRequestController.php:64
 * @route '/api/pickup-requests/{pickup_request}'
 */
update.patch = (args: { pickup_request: string | number } | [pickup_request: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Api\PickupRequestController::destroy
 * @see app/Http/Controllers/Api/PickupRequestController.php:76
 * @route '/api/pickup-requests/{pickup_request}'
 */
export const destroy = (args: { pickup_request: string | number } | [pickup_request: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/pickup-requests/{pickup_request}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\PickupRequestController::destroy
 * @see app/Http/Controllers/Api/PickupRequestController.php:76
 * @route '/api/pickup-requests/{pickup_request}'
 */
destroy.url = (args: { pickup_request: string | number } | [pickup_request: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { pickup_request: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    pickup_request: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        pickup_request: args.pickup_request,
                }

    return destroy.definition.url
            .replace('{pickup_request}', parsedArgs.pickup_request.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PickupRequestController::destroy
 * @see app/Http/Controllers/Api/PickupRequestController.php:76
 * @route '/api/pickup-requests/{pickup_request}'
 */
destroy.delete = (args: { pickup_request: string | number } | [pickup_request: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\PickupRequestController::assign
 * @see app/Http/Controllers/PickupRequestController.php:91
 * @route '/pickup-requests/{pickupRequest}/assign'
 */
export const assign = (args: { pickupRequest: number | { id: number } } | [pickupRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: assign.url(args, options),
    method: 'patch',
})

assign.definition = {
    methods: ["patch"],
    url: '/pickup-requests/{pickupRequest}/assign',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\PickupRequestController::assign
 * @see app/Http/Controllers/PickupRequestController.php:91
 * @route '/pickup-requests/{pickupRequest}/assign'
 */
assign.url = (args: { pickupRequest: number | { id: number } } | [pickupRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { pickupRequest: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { pickupRequest: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    pickupRequest: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        pickupRequest: typeof args.pickupRequest === 'object'
                ? args.pickupRequest.id
                : args.pickupRequest,
                }

    return assign.definition.url
            .replace('{pickupRequest}', parsedArgs.pickupRequest.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PickupRequestController::assign
 * @see app/Http/Controllers/PickupRequestController.php:91
 * @route '/pickup-requests/{pickupRequest}/assign'
 */
assign.patch = (args: { pickupRequest: number | { id: number } } | [pickupRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: assign.url(args, options),
    method: 'patch',
})
const pickupRequests = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
show: Object.assign(show, show),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
assign: Object.assign(assign, assign),
}

export default pickupRequests