import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Api\DriverAssignmentController::index
 * @see app/Http/Controllers/Api/DriverAssignmentController.php:17
 * @route '/api/driver-assignments'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/driver-assignments',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\DriverAssignmentController::index
 * @see app/Http/Controllers/Api/DriverAssignmentController.php:17
 * @route '/api/driver-assignments'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DriverAssignmentController::index
 * @see app/Http/Controllers/Api/DriverAssignmentController.php:17
 * @route '/api/driver-assignments'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\DriverAssignmentController::index
 * @see app/Http/Controllers/Api/DriverAssignmentController.php:17
 * @route '/api/driver-assignments'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\DriverAssignmentController::store
 * @see app/Http/Controllers/Api/DriverAssignmentController.php:24
 * @route '/api/driver-assignments'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/driver-assignments',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\DriverAssignmentController::store
 * @see app/Http/Controllers/Api/DriverAssignmentController.php:24
 * @route '/api/driver-assignments'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DriverAssignmentController::store
 * @see app/Http/Controllers/Api/DriverAssignmentController.php:24
 * @route '/api/driver-assignments'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\DriverAssignmentController::show
 * @see app/Http/Controllers/Api/DriverAssignmentController.php:45
 * @route '/api/driver-assignments/{driver_assignment}'
 */
export const show = (args: { driver_assignment: string | number } | [driver_assignment: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/driver-assignments/{driver_assignment}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\DriverAssignmentController::show
 * @see app/Http/Controllers/Api/DriverAssignmentController.php:45
 * @route '/api/driver-assignments/{driver_assignment}'
 */
show.url = (args: { driver_assignment: string | number } | [driver_assignment: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { driver_assignment: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    driver_assignment: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        driver_assignment: args.driver_assignment,
                }

    return show.definition.url
            .replace('{driver_assignment}', parsedArgs.driver_assignment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DriverAssignmentController::show
 * @see app/Http/Controllers/Api/DriverAssignmentController.php:45
 * @route '/api/driver-assignments/{driver_assignment}'
 */
show.get = (args: { driver_assignment: string | number } | [driver_assignment: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\DriverAssignmentController::show
 * @see app/Http/Controllers/Api/DriverAssignmentController.php:45
 * @route '/api/driver-assignments/{driver_assignment}'
 */
show.head = (args: { driver_assignment: string | number } | [driver_assignment: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\DriverAssignmentController::update
 * @see app/Http/Controllers/Api/DriverAssignmentController.php:50
 * @route '/api/driver-assignments/{driver_assignment}'
 */
export const update = (args: { driver_assignment: string | number } | [driver_assignment: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/driver-assignments/{driver_assignment}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Api\DriverAssignmentController::update
 * @see app/Http/Controllers/Api/DriverAssignmentController.php:50
 * @route '/api/driver-assignments/{driver_assignment}'
 */
update.url = (args: { driver_assignment: string | number } | [driver_assignment: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { driver_assignment: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    driver_assignment: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        driver_assignment: args.driver_assignment,
                }

    return update.definition.url
            .replace('{driver_assignment}', parsedArgs.driver_assignment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DriverAssignmentController::update
 * @see app/Http/Controllers/Api/DriverAssignmentController.php:50
 * @route '/api/driver-assignments/{driver_assignment}'
 */
update.put = (args: { driver_assignment: string | number } | [driver_assignment: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Api\DriverAssignmentController::update
 * @see app/Http/Controllers/Api/DriverAssignmentController.php:50
 * @route '/api/driver-assignments/{driver_assignment}'
 */
update.patch = (args: { driver_assignment: string | number } | [driver_assignment: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Api\DriverAssignmentController::destroy
 * @see app/Http/Controllers/Api/DriverAssignmentController.php:65
 * @route '/api/driver-assignments/{driver_assignment}'
 */
export const destroy = (args: { driver_assignment: string | number } | [driver_assignment: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/driver-assignments/{driver_assignment}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\DriverAssignmentController::destroy
 * @see app/Http/Controllers/Api/DriverAssignmentController.php:65
 * @route '/api/driver-assignments/{driver_assignment}'
 */
destroy.url = (args: { driver_assignment: string | number } | [driver_assignment: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { driver_assignment: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    driver_assignment: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        driver_assignment: args.driver_assignment,
                }

    return destroy.definition.url
            .replace('{driver_assignment}', parsedArgs.driver_assignment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DriverAssignmentController::destroy
 * @see app/Http/Controllers/Api/DriverAssignmentController.php:65
 * @route '/api/driver-assignments/{driver_assignment}'
 */
destroy.delete = (args: { driver_assignment: string | number } | [driver_assignment: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})
const driverAssignments = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
show: Object.assign(show, show),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default driverAssignments