import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
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
const PickupRequestController = { index, assign }

export default PickupRequestController