import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\RouteController::index
 * @see app/Http/Controllers/Api/RouteController.php:11
 * @route '/api/routes'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/routes',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\RouteController::index
 * @see app/Http/Controllers/Api/RouteController.php:11
 * @route '/api/routes'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\RouteController::index
 * @see app/Http/Controllers/Api/RouteController.php:11
 * @route '/api/routes'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\RouteController::index
 * @see app/Http/Controllers/Api/RouteController.php:11
 * @route '/api/routes'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\RouteController::index
 * @see app/Http/Controllers/Api/RouteController.php:11
 * @route '/api/routes'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\RouteController::index
 * @see app/Http/Controllers/Api/RouteController.php:11
 * @route '/api/routes'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\RouteController::index
 * @see app/Http/Controllers/Api/RouteController.php:11
 * @route '/api/routes'
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
* @see \App\Http\Controllers\Api\RouteController::store
 * @see app/Http/Controllers/Api/RouteController.php:16
 * @route '/api/routes'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/routes',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\RouteController::store
 * @see app/Http/Controllers/Api/RouteController.php:16
 * @route '/api/routes'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\RouteController::store
 * @see app/Http/Controllers/Api/RouteController.php:16
 * @route '/api/routes'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\RouteController::store
 * @see app/Http/Controllers/Api/RouteController.php:16
 * @route '/api/routes'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\RouteController::store
 * @see app/Http/Controllers/Api/RouteController.php:16
 * @route '/api/routes'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Api\RouteController::show
 * @see app/Http/Controllers/Api/RouteController.php:31
 * @route '/api/routes/{route}'
 */
export const show = (args: { route: number | { id: number } } | [route: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/routes/{route}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\RouteController::show
 * @see app/Http/Controllers/Api/RouteController.php:31
 * @route '/api/routes/{route}'
 */
show.url = (args: { route: number | { id: number } } | [route: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { route: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { route: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    route: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        route: typeof args.route === 'object'
                ? args.route.id
                : args.route,
                }

    return show.definition.url
            .replace('{route}', parsedArgs.route.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\RouteController::show
 * @see app/Http/Controllers/Api/RouteController.php:31
 * @route '/api/routes/{route}'
 */
show.get = (args: { route: number | { id: number } } | [route: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\RouteController::show
 * @see app/Http/Controllers/Api/RouteController.php:31
 * @route '/api/routes/{route}'
 */
show.head = (args: { route: number | { id: number } } | [route: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\RouteController::show
 * @see app/Http/Controllers/Api/RouteController.php:31
 * @route '/api/routes/{route}'
 */
    const showForm = (args: { route: number | { id: number } } | [route: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\RouteController::show
 * @see app/Http/Controllers/Api/RouteController.php:31
 * @route '/api/routes/{route}'
 */
        showForm.get = (args: { route: number | { id: number } } | [route: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\RouteController::show
 * @see app/Http/Controllers/Api/RouteController.php:31
 * @route '/api/routes/{route}'
 */
        showForm.head = (args: { route: number | { id: number } } | [route: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Api\RouteController::update
 * @see app/Http/Controllers/Api/RouteController.php:36
 * @route '/api/routes/{route}'
 */
export const update = (args: { route: number | { id: number } } | [route: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/routes/{route}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Api\RouteController::update
 * @see app/Http/Controllers/Api/RouteController.php:36
 * @route '/api/routes/{route}'
 */
update.url = (args: { route: number | { id: number } } | [route: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { route: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { route: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    route: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        route: typeof args.route === 'object'
                ? args.route.id
                : args.route,
                }

    return update.definition.url
            .replace('{route}', parsedArgs.route.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\RouteController::update
 * @see app/Http/Controllers/Api/RouteController.php:36
 * @route '/api/routes/{route}'
 */
update.put = (args: { route: number | { id: number } } | [route: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Api\RouteController::update
 * @see app/Http/Controllers/Api/RouteController.php:36
 * @route '/api/routes/{route}'
 */
update.patch = (args: { route: number | { id: number } } | [route: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Api\RouteController::update
 * @see app/Http/Controllers/Api/RouteController.php:36
 * @route '/api/routes/{route}'
 */
    const updateForm = (args: { route: number | { id: number } } | [route: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\RouteController::update
 * @see app/Http/Controllers/Api/RouteController.php:36
 * @route '/api/routes/{route}'
 */
        updateForm.put = (args: { route: number | { id: number } } | [route: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\Api\RouteController::update
 * @see app/Http/Controllers/Api/RouteController.php:36
 * @route '/api/routes/{route}'
 */
        updateForm.patch = (args: { route: number | { id: number } } | [route: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Api\RouteController::destroy
 * @see app/Http/Controllers/Api/RouteController.php:51
 * @route '/api/routes/{route}'
 */
export const destroy = (args: { route: number | { id: number } } | [route: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/routes/{route}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\RouteController::destroy
 * @see app/Http/Controllers/Api/RouteController.php:51
 * @route '/api/routes/{route}'
 */
destroy.url = (args: { route: number | { id: number } } | [route: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { route: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { route: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    route: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        route: typeof args.route === 'object'
                ? args.route.id
                : args.route,
                }

    return destroy.definition.url
            .replace('{route}', parsedArgs.route.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\RouteController::destroy
 * @see app/Http/Controllers/Api/RouteController.php:51
 * @route '/api/routes/{route}'
 */
destroy.delete = (args: { route: number | { id: number } } | [route: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Api\RouteController::destroy
 * @see app/Http/Controllers/Api/RouteController.php:51
 * @route '/api/routes/{route}'
 */
    const destroyForm = (args: { route: number | { id: number } } | [route: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\RouteController::destroy
 * @see app/Http/Controllers/Api/RouteController.php:51
 * @route '/api/routes/{route}'
 */
        destroyForm.delete = (args: { route: number | { id: number } } | [route: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const RouteController = { index, store, show, update, destroy }

export default RouteController