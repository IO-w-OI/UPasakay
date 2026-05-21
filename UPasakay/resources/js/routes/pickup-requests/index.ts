import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Api\PickupRequestController::index
 * @see app/Http/Controllers/Api/PickupRequestController.php:38
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
 * @see app/Http/Controllers/Api/PickupRequestController.php:38
 * @route '/api/pickup-requests'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PickupRequestController::index
 * @see app/Http/Controllers/Api/PickupRequestController.php:38
 * @route '/api/pickup-requests'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\PickupRequestController::index
 * @see app/Http/Controllers/Api/PickupRequestController.php:38
 * @route '/api/pickup-requests'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\PickupRequestController::index
 * @see app/Http/Controllers/Api/PickupRequestController.php:38
 * @route '/api/pickup-requests'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\PickupRequestController::index
 * @see app/Http/Controllers/Api/PickupRequestController.php:38
 * @route '/api/pickup-requests'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\PickupRequestController::index
 * @see app/Http/Controllers/Api/PickupRequestController.php:38
 * @route '/api/pickup-requests'
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
* @see \App\Http\Controllers\PickupRequestController::index
 * @see app/Http/Controllers/PickupRequestController.php:42
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
 * @see app/Http/Controllers/PickupRequestController.php:42
 * @route '/pickup-requests'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PickupRequestController::index
 * @see app/Http/Controllers/PickupRequestController.php:42
 * @route '/pickup-requests'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PickupRequestController::index
 * @see app/Http/Controllers/PickupRequestController.php:42
 * @route '/pickup-requests'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PickupRequestController::index
 * @see app/Http/Controllers/PickupRequestController.php:42
 * @route '/pickup-requests'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PickupRequestController::index
 * @see app/Http/Controllers/PickupRequestController.php:42
 * @route '/pickup-requests'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PickupRequestController::index
 * @see app/Http/Controllers/PickupRequestController.php:42
 * @route '/pickup-requests'
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
* @see \App\Http\Controllers\Api\PickupRequestController::store
 * @see app/Http/Controllers/Api/PickupRequestController.php:45
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
 * @see app/Http/Controllers/Api/PickupRequestController.php:45
 * @route '/api/pickup-requests'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PickupRequestController::store
 * @see app/Http/Controllers/Api/PickupRequestController.php:45
 * @route '/api/pickup-requests'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\PickupRequestController::store
 * @see app/Http/Controllers/Api/PickupRequestController.php:45
 * @route '/api/pickup-requests'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\PickupRequestController::store
 * @see app/Http/Controllers/Api/PickupRequestController.php:45
 * @route '/api/pickup-requests'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Api\PickupRequestController::show
 * @see app/Http/Controllers/Api/PickupRequestController.php:88
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
 * @see app/Http/Controllers/Api/PickupRequestController.php:88
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
 * @see app/Http/Controllers/Api/PickupRequestController.php:88
 * @route '/api/pickup-requests/{pickup_request}'
 */
show.get = (args: { pickup_request: string | number } | [pickup_request: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\PickupRequestController::show
 * @see app/Http/Controllers/Api/PickupRequestController.php:88
 * @route '/api/pickup-requests/{pickup_request}'
 */
show.head = (args: { pickup_request: string | number } | [pickup_request: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\PickupRequestController::show
 * @see app/Http/Controllers/Api/PickupRequestController.php:88
 * @route '/api/pickup-requests/{pickup_request}'
 */
    const showForm = (args: { pickup_request: string | number } | [pickup_request: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\PickupRequestController::show
 * @see app/Http/Controllers/Api/PickupRequestController.php:88
 * @route '/api/pickup-requests/{pickup_request}'
 */
        showForm.get = (args: { pickup_request: string | number } | [pickup_request: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\PickupRequestController::show
 * @see app/Http/Controllers/Api/PickupRequestController.php:88
 * @route '/api/pickup-requests/{pickup_request}'
 */
        showForm.head = (args: { pickup_request: string | number } | [pickup_request: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
/**
* @see \App\Http\Controllers\Api\PickupRequestController::update
 * @see app/Http/Controllers/Api/PickupRequestController.php:102
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
 * @see app/Http/Controllers/Api/PickupRequestController.php:102
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
 * @see app/Http/Controllers/Api/PickupRequestController.php:102
 * @route '/api/pickup-requests/{pickup_request}'
 */
update.put = (args: { pickup_request: string | number } | [pickup_request: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Api\PickupRequestController::update
 * @see app/Http/Controllers/Api/PickupRequestController.php:102
 * @route '/api/pickup-requests/{pickup_request}'
 */
update.patch = (args: { pickup_request: string | number } | [pickup_request: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Api\PickupRequestController::update
 * @see app/Http/Controllers/Api/PickupRequestController.php:102
 * @route '/api/pickup-requests/{pickup_request}'
 */
    const updateForm = (args: { pickup_request: string | number } | [pickup_request: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\PickupRequestController::update
 * @see app/Http/Controllers/Api/PickupRequestController.php:102
 * @route '/api/pickup-requests/{pickup_request}'
 */
        updateForm.put = (args: { pickup_request: string | number } | [pickup_request: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\Api\PickupRequestController::update
 * @see app/Http/Controllers/Api/PickupRequestController.php:102
 * @route '/api/pickup-requests/{pickup_request}'
 */
        updateForm.patch = (args: { pickup_request: string | number } | [pickup_request: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Api\PickupRequestController::destroy
 * @see app/Http/Controllers/Api/PickupRequestController.php:199
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
 * @see app/Http/Controllers/Api/PickupRequestController.php:199
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
 * @see app/Http/Controllers/Api/PickupRequestController.php:199
 * @route '/api/pickup-requests/{pickup_request}'
 */
destroy.delete = (args: { pickup_request: string | number } | [pickup_request: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Api\PickupRequestController::destroy
 * @see app/Http/Controllers/Api/PickupRequestController.php:199
 * @route '/api/pickup-requests/{pickup_request}'
 */
    const destroyForm = (args: { pickup_request: string | number } | [pickup_request: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\PickupRequestController::destroy
 * @see app/Http/Controllers/Api/PickupRequestController.php:199
 * @route '/api/pickup-requests/{pickup_request}'
 */
        destroyForm.delete = (args: { pickup_request: string | number } | [pickup_request: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
/**
* @see \App\Http\Controllers\PickupRequestController::exportMethod
 * @see app/Http/Controllers/PickupRequestController.php:103
 * @route '/pickup-requests/export'
 */
export const exportMethod = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/pickup-requests/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PickupRequestController::exportMethod
 * @see app/Http/Controllers/PickupRequestController.php:103
 * @route '/pickup-requests/export'
 */
exportMethod.url = (options?: RouteQueryOptions) => {
    return exportMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PickupRequestController::exportMethod
 * @see app/Http/Controllers/PickupRequestController.php:103
 * @route '/pickup-requests/export'
 */
exportMethod.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PickupRequestController::exportMethod
 * @see app/Http/Controllers/PickupRequestController.php:103
 * @route '/pickup-requests/export'
 */
exportMethod.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PickupRequestController::exportMethod
 * @see app/Http/Controllers/PickupRequestController.php:103
 * @route '/pickup-requests/export'
 */
    const exportMethodForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: exportMethod.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PickupRequestController::exportMethod
 * @see app/Http/Controllers/PickupRequestController.php:103
 * @route '/pickup-requests/export'
 */
        exportMethodForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: exportMethod.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PickupRequestController::exportMethod
 * @see app/Http/Controllers/PickupRequestController.php:103
 * @route '/pickup-requests/export'
 */
        exportMethodForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: exportMethod.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    exportMethod.form = exportMethodForm
const pickupRequests = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
show: Object.assign(show, show),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
export: Object.assign(exportMethod, exportMethod),
}

export default pickupRequests