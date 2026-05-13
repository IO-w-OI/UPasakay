import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
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
* @see \App\Http\Controllers\PassengerApprovalController::index
 * @see app/Http/Controllers/PassengerApprovalController.php:11
 * @route '/passengers'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PassengerApprovalController::index
 * @see app/Http/Controllers/PassengerApprovalController.php:11
 * @route '/passengers'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PassengerApprovalController::index
 * @see app/Http/Controllers/PassengerApprovalController.php:11
 * @route '/passengers'
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
* @see \App\Http\Controllers\PassengerApprovalController::updateStatus
 * @see app/Http/Controllers/PassengerApprovalController.php:70
 * @route '/passengers/{passenger}/status'
 */
    const updateStatusForm = (args: { passenger: number | { id: number } } | [passenger: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateStatus.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PassengerApprovalController::updateStatus
 * @see app/Http/Controllers/PassengerApprovalController.php:70
 * @route '/passengers/{passenger}/status'
 */
        updateStatusForm.patch = (args: { passenger: number | { id: number } } | [passenger: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\PassengerApprovalController::bulkStatus
 * @see app/Http/Controllers/PassengerApprovalController.php:86
 * @route '/passengers/bulk-status'
 */
export const bulkStatus = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: bulkStatus.url(options),
    method: 'patch',
})

bulkStatus.definition = {
    methods: ["patch"],
    url: '/passengers/bulk-status',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\PassengerApprovalController::bulkStatus
 * @see app/Http/Controllers/PassengerApprovalController.php:86
 * @route '/passengers/bulk-status'
 */
bulkStatus.url = (options?: RouteQueryOptions) => {
    return bulkStatus.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PassengerApprovalController::bulkStatus
 * @see app/Http/Controllers/PassengerApprovalController.php:86
 * @route '/passengers/bulk-status'
 */
bulkStatus.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: bulkStatus.url(options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\PassengerApprovalController::bulkStatus
 * @see app/Http/Controllers/PassengerApprovalController.php:86
 * @route '/passengers/bulk-status'
 */
    const bulkStatusForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: bulkStatus.url({
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PassengerApprovalController::bulkStatus
 * @see app/Http/Controllers/PassengerApprovalController.php:86
 * @route '/passengers/bulk-status'
 */
        bulkStatusForm.patch = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: bulkStatus.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    bulkStatus.form = bulkStatusForm
const passengers = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
show: Object.assign(show, show),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
updateStatus: Object.assign(updateStatus, updateStatus),
bulkStatus: Object.assign(bulkStatus, bulkStatus),
}

export default passengers