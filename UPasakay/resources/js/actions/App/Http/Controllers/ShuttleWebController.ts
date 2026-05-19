import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ShuttleWebController::store
 * @see app/Http/Controllers/ShuttleWebController.php:10
 * @route '/shuttles'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/shuttles',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ShuttleWebController::store
 * @see app/Http/Controllers/ShuttleWebController.php:10
 * @route '/shuttles'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ShuttleWebController::store
 * @see app/Http/Controllers/ShuttleWebController.php:10
 * @route '/shuttles'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ShuttleWebController::store
 * @see app/Http/Controllers/ShuttleWebController.php:10
 * @route '/shuttles'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ShuttleWebController::store
 * @see app/Http/Controllers/ShuttleWebController.php:10
 * @route '/shuttles'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\ShuttleWebController::update
 * @see app/Http/Controllers/ShuttleWebController.php:41
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
 * @see app/Http/Controllers/ShuttleWebController.php:41
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
 * @see app/Http/Controllers/ShuttleWebController.php:41
 * @route '/shuttles/{shuttle}'
 */
update.patch = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\ShuttleWebController::update
 * @see app/Http/Controllers/ShuttleWebController.php:41
 * @route '/shuttles/{shuttle}'
 */
    const updateForm = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ShuttleWebController::update
 * @see app/Http/Controllers/ShuttleWebController.php:41
 * @route '/shuttles/{shuttle}'
 */
        updateForm.patch = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\ShuttleWebController::assignDriver
 * @see app/Http/Controllers/ShuttleWebController.php:81
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
 * @see app/Http/Controllers/ShuttleWebController.php:81
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
 * @see app/Http/Controllers/ShuttleWebController.php:81
 * @route '/shuttles/{shuttle}/assign-driver'
 */
assignDriver.patch = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: assignDriver.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\ShuttleWebController::assignDriver
 * @see app/Http/Controllers/ShuttleWebController.php:81
 * @route '/shuttles/{shuttle}/assign-driver'
 */
    const assignDriverForm = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: assignDriver.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ShuttleWebController::assignDriver
 * @see app/Http/Controllers/ShuttleWebController.php:81
 * @route '/shuttles/{shuttle}/assign-driver'
 */
        assignDriverForm.patch = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: assignDriver.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    assignDriver.form = assignDriverForm
/**
* @see \App\Http\Controllers\ShuttleWebController::assignRoute
 * @see app/Http/Controllers/ShuttleWebController.php:104
 * @route '/shuttles/{shuttle}/assign-route'
 */
export const assignRoute = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: assignRoute.url(args, options),
    method: 'patch',
})

assignRoute.definition = {
    methods: ["patch"],
    url: '/shuttles/{shuttle}/assign-route',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\ShuttleWebController::assignRoute
 * @see app/Http/Controllers/ShuttleWebController.php:104
 * @route '/shuttles/{shuttle}/assign-route'
 */
assignRoute.url = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return assignRoute.definition.url
            .replace('{shuttle}', parsedArgs.shuttle.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ShuttleWebController::assignRoute
 * @see app/Http/Controllers/ShuttleWebController.php:104
 * @route '/shuttles/{shuttle}/assign-route'
 */
assignRoute.patch = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: assignRoute.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\ShuttleWebController::assignRoute
 * @see app/Http/Controllers/ShuttleWebController.php:104
 * @route '/shuttles/{shuttle}/assign-route'
 */
    const assignRouteForm = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: assignRoute.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ShuttleWebController::assignRoute
 * @see app/Http/Controllers/ShuttleWebController.php:104
 * @route '/shuttles/{shuttle}/assign-route'
 */
        assignRouteForm.patch = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: assignRoute.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    assignRoute.form = assignRouteForm
/**
* @see \App\Http\Controllers\ShuttleWebController::updateStatus
 * @see app/Http/Controllers/ShuttleWebController.php:115
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
 * @see app/Http/Controllers/ShuttleWebController.php:115
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
 * @see app/Http/Controllers/ShuttleWebController.php:115
 * @route '/shuttles/{shuttle}/status'
 */
updateStatus.patch = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateStatus.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\ShuttleWebController::updateStatus
 * @see app/Http/Controllers/ShuttleWebController.php:115
 * @route '/shuttles/{shuttle}/status'
 */
    const updateStatusForm = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateStatus.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ShuttleWebController::updateStatus
 * @see app/Http/Controllers/ShuttleWebController.php:115
 * @route '/shuttles/{shuttle}/status'
 */
        updateStatusForm.patch = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateStatus.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateStatus.form = updateStatusForm
/**
* @see \App\Http\Controllers\ShuttleWebController::regenerateBoardingCode
 * @see app/Http/Controllers/ShuttleWebController.php:34
 * @route '/shuttles/{shuttle}/regenerate-boarding-code'
 */
export const regenerateBoardingCode = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: regenerateBoardingCode.url(args, options),
    method: 'patch',
})

regenerateBoardingCode.definition = {
    methods: ["patch"],
    url: '/shuttles/{shuttle}/regenerate-boarding-code',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\ShuttleWebController::regenerateBoardingCode
 * @see app/Http/Controllers/ShuttleWebController.php:34
 * @route '/shuttles/{shuttle}/regenerate-boarding-code'
 */
regenerateBoardingCode.url = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return regenerateBoardingCode.definition.url
            .replace('{shuttle}', parsedArgs.shuttle.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ShuttleWebController::regenerateBoardingCode
 * @see app/Http/Controllers/ShuttleWebController.php:34
 * @route '/shuttles/{shuttle}/regenerate-boarding-code'
 */
regenerateBoardingCode.patch = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: regenerateBoardingCode.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\ShuttleWebController::regenerateBoardingCode
 * @see app/Http/Controllers/ShuttleWebController.php:34
 * @route '/shuttles/{shuttle}/regenerate-boarding-code'
 */
    const regenerateBoardingCodeForm = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: regenerateBoardingCode.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ShuttleWebController::regenerateBoardingCode
 * @see app/Http/Controllers/ShuttleWebController.php:34
 * @route '/shuttles/{shuttle}/regenerate-boarding-code'
 */
        regenerateBoardingCodeForm.patch = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: regenerateBoardingCode.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    regenerateBoardingCode.form = regenerateBoardingCodeForm
/**
* @see \App\Http\Controllers\ShuttleWebController::destroy
 * @see app/Http/Controllers/ShuttleWebController.php:129
 * @route '/shuttles/{shuttle}'
 */
export const destroy = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/shuttles/{shuttle}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ShuttleWebController::destroy
 * @see app/Http/Controllers/ShuttleWebController.php:129
 * @route '/shuttles/{shuttle}'
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
* @see \App\Http\Controllers\ShuttleWebController::destroy
 * @see app/Http/Controllers/ShuttleWebController.php:129
 * @route '/shuttles/{shuttle}'
 */
destroy.delete = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\ShuttleWebController::destroy
 * @see app/Http/Controllers/ShuttleWebController.php:129
 * @route '/shuttles/{shuttle}'
 */
    const destroyForm = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ShuttleWebController::destroy
 * @see app/Http/Controllers/ShuttleWebController.php:129
 * @route '/shuttles/{shuttle}'
 */
        destroyForm.delete = (args: { shuttle: number | { id: number } } | [shuttle: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const ShuttleWebController = { store, update, assignDriver, assignRoute, updateStatus, regenerateBoardingCode, destroy }

export default ShuttleWebController