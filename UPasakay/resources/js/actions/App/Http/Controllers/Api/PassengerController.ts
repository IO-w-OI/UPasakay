import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\PassengerController::index
 * @see app/Http/Controllers/Api/PassengerController.php:17
 * @route '/api/passengers'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/passengers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PassengerController::index
 * @see app/Http/Controllers/Api/PassengerController.php:17
 * @route '/api/passengers'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PassengerController::index
 * @see app/Http/Controllers/Api/PassengerController.php:17
 * @route '/api/passengers'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\PassengerController::index
 * @see app/Http/Controllers/Api/PassengerController.php:17
 * @route '/api/passengers'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\PassengerController::index
 * @see app/Http/Controllers/Api/PassengerController.php:17
 * @route '/api/passengers'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\PassengerController::index
 * @see app/Http/Controllers/Api/PassengerController.php:17
 * @route '/api/passengers'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\PassengerController::index
 * @see app/Http/Controllers/Api/PassengerController.php:17
 * @route '/api/passengers'
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
* @see \App\Http\Controllers\Api\PassengerController::store
 * @see app/Http/Controllers/Api/PassengerController.php:29
 * @route '/api/passengers'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/passengers',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\PassengerController::store
 * @see app/Http/Controllers/Api/PassengerController.php:29
 * @route '/api/passengers'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PassengerController::store
 * @see app/Http/Controllers/Api/PassengerController.php:29
 * @route '/api/passengers'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\PassengerController::store
 * @see app/Http/Controllers/Api/PassengerController.php:29
 * @route '/api/passengers'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\PassengerController::store
 * @see app/Http/Controllers/Api/PassengerController.php:29
 * @route '/api/passengers'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Api\PassengerController::show
 * @see app/Http/Controllers/Api/PassengerController.php:68
 * @route '/api/passengers/{passenger}'
 */
export const show = (args: { passenger: string | number } | [passenger: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/passengers/{passenger}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PassengerController::show
 * @see app/Http/Controllers/Api/PassengerController.php:68
 * @route '/api/passengers/{passenger}'
 */
show.url = (args: { passenger: string | number } | [passenger: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { passenger: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    passenger: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        passenger: args.passenger,
                }

    return show.definition.url
            .replace('{passenger}', parsedArgs.passenger.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PassengerController::show
 * @see app/Http/Controllers/Api/PassengerController.php:68
 * @route '/api/passengers/{passenger}'
 */
show.get = (args: { passenger: string | number } | [passenger: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\PassengerController::show
 * @see app/Http/Controllers/Api/PassengerController.php:68
 * @route '/api/passengers/{passenger}'
 */
show.head = (args: { passenger: string | number } | [passenger: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\PassengerController::show
 * @see app/Http/Controllers/Api/PassengerController.php:68
 * @route '/api/passengers/{passenger}'
 */
    const showForm = (args: { passenger: string | number } | [passenger: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\PassengerController::show
 * @see app/Http/Controllers/Api/PassengerController.php:68
 * @route '/api/passengers/{passenger}'
 */
        showForm.get = (args: { passenger: string | number } | [passenger: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\PassengerController::show
 * @see app/Http/Controllers/Api/PassengerController.php:68
 * @route '/api/passengers/{passenger}'
 */
        showForm.head = (args: { passenger: string | number } | [passenger: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Api\PassengerController::update
 * @see app/Http/Controllers/Api/PassengerController.php:82
 * @route '/api/passengers/{passenger}'
 */
export const update = (args: { passenger: string | number } | [passenger: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/passengers/{passenger}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Api\PassengerController::update
 * @see app/Http/Controllers/Api/PassengerController.php:82
 * @route '/api/passengers/{passenger}'
 */
update.url = (args: { passenger: string | number } | [passenger: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { passenger: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    passenger: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        passenger: args.passenger,
                }

    return update.definition.url
            .replace('{passenger}', parsedArgs.passenger.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PassengerController::update
 * @see app/Http/Controllers/Api/PassengerController.php:82
 * @route '/api/passengers/{passenger}'
 */
update.put = (args: { passenger: string | number } | [passenger: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Api\PassengerController::update
 * @see app/Http/Controllers/Api/PassengerController.php:82
 * @route '/api/passengers/{passenger}'
 */
update.patch = (args: { passenger: string | number } | [passenger: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Api\PassengerController::update
 * @see app/Http/Controllers/Api/PassengerController.php:82
 * @route '/api/passengers/{passenger}'
 */
    const updateForm = (args: { passenger: string | number } | [passenger: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\PassengerController::update
 * @see app/Http/Controllers/Api/PassengerController.php:82
 * @route '/api/passengers/{passenger}'
 */
        updateForm.put = (args: { passenger: string | number } | [passenger: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\Api\PassengerController::update
 * @see app/Http/Controllers/Api/PassengerController.php:82
 * @route '/api/passengers/{passenger}'
 */
        updateForm.patch = (args: { passenger: string | number } | [passenger: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Api\PassengerController::destroy
 * @see app/Http/Controllers/Api/PassengerController.php:132
 * @route '/api/passengers/{passenger}'
 */
export const destroy = (args: { passenger: string | number } | [passenger: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/passengers/{passenger}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\PassengerController::destroy
 * @see app/Http/Controllers/Api/PassengerController.php:132
 * @route '/api/passengers/{passenger}'
 */
destroy.url = (args: { passenger: string | number } | [passenger: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { passenger: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    passenger: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        passenger: args.passenger,
                }

    return destroy.definition.url
            .replace('{passenger}', parsedArgs.passenger.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PassengerController::destroy
 * @see app/Http/Controllers/Api/PassengerController.php:132
 * @route '/api/passengers/{passenger}'
 */
destroy.delete = (args: { passenger: string | number } | [passenger: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Api\PassengerController::destroy
 * @see app/Http/Controllers/Api/PassengerController.php:132
 * @route '/api/passengers/{passenger}'
 */
    const destroyForm = (args: { passenger: string | number } | [passenger: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\PassengerController::destroy
 * @see app/Http/Controllers/Api/PassengerController.php:132
 * @route '/api/passengers/{passenger}'
 */
        destroyForm.delete = (args: { passenger: string | number } | [passenger: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const PassengerController = { index, store, show, update, destroy }

export default PassengerController