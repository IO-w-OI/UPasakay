import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ShuttleWebController::update
 * @see app/Http/Controllers/ShuttleWebController.php:11
 * @route '/shuttles/{shuttle}'
 */
export const update = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/shuttles/{shuttle}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\ShuttleWebController::update
 * @see app/Http/Controllers/ShuttleWebController.php:11
 * @route '/shuttles/{shuttle}'
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
* @see \App\Http\Controllers\ShuttleWebController::update
 * @see app/Http/Controllers/ShuttleWebController.php:11
 * @route '/shuttles/{shuttle}'
 */
update.patch = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\ShuttleWebController::assignDriver
 * @see app/Http/Controllers/ShuttleWebController.php:51
 * @route '/shuttles/{shuttle}/assign-driver'
 */
export const assignDriver = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: assignDriver.url(args, options),
    method: 'patch',
})

assignDriver.definition = {
    methods: ["patch"],
    url: '/shuttles/{shuttle}/assign-driver',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\ShuttleWebController::assignDriver
 * @see app/Http/Controllers/ShuttleWebController.php:51
 * @route '/shuttles/{shuttle}/assign-driver'
 */
assignDriver.url = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return assignDriver.definition.url
            .replace('{shuttle}', parsedArgs.shuttle.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ShuttleWebController::assignDriver
 * @see app/Http/Controllers/ShuttleWebController.php:51
 * @route '/shuttles/{shuttle}/assign-driver'
 */
assignDriver.patch = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: assignDriver.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\ShuttleWebController::updateStatus
 * @see app/Http/Controllers/ShuttleWebController.php:74
 * @route '/shuttles/{shuttle}/status'
 */
export const updateStatus = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateStatus.url(args, options),
    method: 'patch',
})

updateStatus.definition = {
    methods: ["patch"],
    url: '/shuttles/{shuttle}/status',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\ShuttleWebController::updateStatus
 * @see app/Http/Controllers/ShuttleWebController.php:74
 * @route '/shuttles/{shuttle}/status'
 */
updateStatus.url = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return updateStatus.definition.url
            .replace('{shuttle}', parsedArgs.shuttle.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ShuttleWebController::updateStatus
 * @see app/Http/Controllers/ShuttleWebController.php:74
 * @route '/shuttles/{shuttle}/status'
 */
updateStatus.patch = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateStatus.url(args, options),
    method: 'patch',
})
const ShuttleWebController = { update, assignDriver, updateStatus }

export default ShuttleWebController