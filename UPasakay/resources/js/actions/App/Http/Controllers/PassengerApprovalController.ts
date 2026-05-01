import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\PassengerApprovalController::index
 * @see app/Http/Controllers/PassengerApprovalController.php:11
 * @route '/passengers'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/passengers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PassengerApprovalController::index
 * @see app/Http/Controllers/PassengerApprovalController.php:11
 * @route '/passengers'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PassengerApprovalController::index
 * @see app/Http/Controllers/PassengerApprovalController.php:11
 * @route '/passengers'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PassengerApprovalController::index
 * @see app/Http/Controllers/PassengerApprovalController.php:11
 * @route '/passengers'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PassengerApprovalController::updateStatus
 * @see app/Http/Controllers/PassengerApprovalController.php:70
 * @route '/passengers/{passenger}/status'
 */
export const updateStatus = (args: { passenger: number | { id: number } } | [passenger: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateStatus.url(args, options),
    method: 'patch',
})

updateStatus.definition = {
    methods: ["patch"],
    url: '/passengers/{passenger}/status',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\PassengerApprovalController::updateStatus
 * @see app/Http/Controllers/PassengerApprovalController.php:70
 * @route '/passengers/{passenger}/status'
 */
updateStatus.url = (args: { passenger: number | { id: number } } | [passenger: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { passenger: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { passenger: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    passenger: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        passenger: typeof args.passenger === 'object'
                ? args.passenger.id
                : args.passenger,
                }

    return updateStatus.definition.url
            .replace('{passenger}', parsedArgs.passenger.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PassengerApprovalController::updateStatus
 * @see app/Http/Controllers/PassengerApprovalController.php:70
 * @route '/passengers/{passenger}/status'
 */
updateStatus.patch = (args: { passenger: number | { id: number } } | [passenger: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateStatus.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\PassengerApprovalController::bulkUpdateStatus
 * @see app/Http/Controllers/PassengerApprovalController.php:86
 * @route '/passengers/bulk-status'
 */
export const bulkUpdateStatus = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: bulkUpdateStatus.url(options),
    method: 'patch',
})

bulkUpdateStatus.definition = {
    methods: ["patch"],
    url: '/passengers/bulk-status',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\PassengerApprovalController::bulkUpdateStatus
 * @see app/Http/Controllers/PassengerApprovalController.php:86
 * @route '/passengers/bulk-status'
 */
bulkUpdateStatus.url = (options?: RouteQueryOptions) => {
    return bulkUpdateStatus.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PassengerApprovalController::bulkUpdateStatus
 * @see app/Http/Controllers/PassengerApprovalController.php:86
 * @route '/passengers/bulk-status'
 */
bulkUpdateStatus.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: bulkUpdateStatus.url(options),
    method: 'patch',
})
const PassengerApprovalController = { index, updateStatus, bulkUpdateStatus }

export default PassengerApprovalController