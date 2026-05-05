import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\DriverController::index
 * @see app/Http/Controllers/Api/DriverController.php:11
 * @route '/api/drivers'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/drivers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\DriverController::index
 * @see app/Http/Controllers/Api/DriverController.php:11
 * @route '/api/drivers'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DriverController::index
 * @see app/Http/Controllers/Api/DriverController.php:11
 * @route '/api/drivers'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\DriverController::index
 * @see app/Http/Controllers/Api/DriverController.php:11
 * @route '/api/drivers'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\DriverController::index
 * @see app/Http/Controllers/Api/DriverController.php:11
 * @route '/api/drivers'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\DriverController::index
 * @see app/Http/Controllers/Api/DriverController.php:11
 * @route '/api/drivers'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\DriverController::index
 * @see app/Http/Controllers/Api/DriverController.php:11
 * @route '/api/drivers'
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
* @see \App\Http\Controllers\Api\DriverController::store
 * @see app/Http/Controllers/Api/DriverController.php:16
 * @route '/api/drivers'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/drivers',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\DriverController::store
 * @see app/Http/Controllers/Api/DriverController.php:16
 * @route '/api/drivers'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DriverController::store
 * @see app/Http/Controllers/Api/DriverController.php:16
 * @route '/api/drivers'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\DriverController::store
 * @see app/Http/Controllers/Api/DriverController.php:16
 * @route '/api/drivers'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\DriverController::store
 * @see app/Http/Controllers/Api/DriverController.php:16
 * @route '/api/drivers'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Api\DriverController::show
 * @see app/Http/Controllers/Api/DriverController.php:28
 * @route '/api/drivers/{driver}'
 */
export const show = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/drivers/{driver}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\DriverController::show
 * @see app/Http/Controllers/Api/DriverController.php:28
 * @route '/api/drivers/{driver}'
 */
show.url = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { driver: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { driver: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    driver: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        driver: typeof args.driver === 'object'
                ? args.driver.id
                : args.driver,
                }

    return show.definition.url
            .replace('{driver}', parsedArgs.driver.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DriverController::show
 * @see app/Http/Controllers/Api/DriverController.php:28
 * @route '/api/drivers/{driver}'
 */
show.get = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\DriverController::show
 * @see app/Http/Controllers/Api/DriverController.php:28
 * @route '/api/drivers/{driver}'
 */
show.head = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\DriverController::show
 * @see app/Http/Controllers/Api/DriverController.php:28
 * @route '/api/drivers/{driver}'
 */
    const showForm = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\DriverController::show
 * @see app/Http/Controllers/Api/DriverController.php:28
 * @route '/api/drivers/{driver}'
 */
        showForm.get = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\DriverController::show
 * @see app/Http/Controllers/Api/DriverController.php:28
 * @route '/api/drivers/{driver}'
 */
        showForm.head = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Api\DriverController::update
 * @see app/Http/Controllers/Api/DriverController.php:33
 * @route '/api/drivers/{driver}'
 */
export const update = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/drivers/{driver}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Api\DriverController::update
 * @see app/Http/Controllers/Api/DriverController.php:33
 * @route '/api/drivers/{driver}'
 */
update.url = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { driver: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { driver: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    driver: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        driver: typeof args.driver === 'object'
                ? args.driver.id
                : args.driver,
                }

    return update.definition.url
            .replace('{driver}', parsedArgs.driver.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DriverController::update
 * @see app/Http/Controllers/Api/DriverController.php:33
 * @route '/api/drivers/{driver}'
 */
update.put = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Api\DriverController::update
 * @see app/Http/Controllers/Api/DriverController.php:33
 * @route '/api/drivers/{driver}'
 */
update.patch = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Api\DriverController::update
 * @see app/Http/Controllers/Api/DriverController.php:33
 * @route '/api/drivers/{driver}'
 */
    const updateForm = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\DriverController::update
 * @see app/Http/Controllers/Api/DriverController.php:33
 * @route '/api/drivers/{driver}'
 */
        updateForm.put = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\Api\DriverController::update
 * @see app/Http/Controllers/Api/DriverController.php:33
 * @route '/api/drivers/{driver}'
 */
        updateForm.patch = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Api\DriverController::destroy
 * @see app/Http/Controllers/Api/DriverController.php:44
 * @route '/api/drivers/{driver}'
 */
export const destroy = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/drivers/{driver}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\DriverController::destroy
 * @see app/Http/Controllers/Api/DriverController.php:44
 * @route '/api/drivers/{driver}'
 */
destroy.url = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { driver: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { driver: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    driver: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        driver: typeof args.driver === 'object'
                ? args.driver.id
                : args.driver,
                }

    return destroy.definition.url
            .replace('{driver}', parsedArgs.driver.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DriverController::destroy
 * @see app/Http/Controllers/Api/DriverController.php:44
 * @route '/api/drivers/{driver}'
 */
destroy.delete = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Api\DriverController::destroy
 * @see app/Http/Controllers/Api/DriverController.php:44
 * @route '/api/drivers/{driver}'
 */
    const destroyForm = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\DriverController::destroy
 * @see app/Http/Controllers/Api/DriverController.php:44
 * @route '/api/drivers/{driver}'
 */
        destroyForm.delete = (args: { driver: number | { id: number } } | [driver: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const DriverController = { index, store, show, update, destroy }

export default DriverController