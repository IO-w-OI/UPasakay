import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
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
const shuttles = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
show: Object.assign(show, show),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
assignDriver: Object.assign(assignDriver, assignDriver),
updateStatus: Object.assign(updateStatus, updateStatus),
}

export default shuttles