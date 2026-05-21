import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\NotificationController::index
 * @see app/Http/Controllers/NotificationController.php:14
 * @route '/notifications'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/notifications',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\NotificationController::index
 * @see app/Http/Controllers/NotificationController.php:14
 * @route '/notifications'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\NotificationController::index
 * @see app/Http/Controllers/NotificationController.php:14
 * @route '/notifications'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\NotificationController::index
 * @see app/Http/Controllers/NotificationController.php:14
 * @route '/notifications'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\NotificationController::index
 * @see app/Http/Controllers/NotificationController.php:14
 * @route '/notifications'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\NotificationController::index
 * @see app/Http/Controllers/NotificationController.php:14
 * @route '/notifications'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\NotificationController::index
 * @see app/Http/Controllers/NotificationController.php:14
 * @route '/notifications'
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
* @see \App\Http\Controllers\NotificationController::store
 * @see app/Http/Controllers/NotificationController.php:76
 * @route '/notifications'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/notifications',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\NotificationController::store
 * @see app/Http/Controllers/NotificationController.php:76
 * @route '/notifications'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\NotificationController::store
 * @see app/Http/Controllers/NotificationController.php:76
 * @route '/notifications'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\NotificationController::store
 * @see app/Http/Controllers/NotificationController.php:76
 * @route '/notifications'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\NotificationController::store
 * @see app/Http/Controllers/NotificationController.php:76
 * @route '/notifications'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\NotificationController::destroy
 * @see app/Http/Controllers/NotificationController.php:129
 * @route '/notifications/{id}'
 */
export const destroy = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/notifications/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\NotificationController::destroy
 * @see app/Http/Controllers/NotificationController.php:129
 * @route '/notifications/{id}'
 */
destroy.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return destroy.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\NotificationController::destroy
 * @see app/Http/Controllers/NotificationController.php:129
 * @route '/notifications/{id}'
 */
destroy.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\NotificationController::destroy
 * @see app/Http/Controllers/NotificationController.php:129
 * @route '/notifications/{id}'
 */
    const destroyForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\NotificationController::destroy
 * @see app/Http/Controllers/NotificationController.php:129
 * @route '/notifications/{id}'
 */
        destroyForm.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\NotificationController::storeSchedule
 * @see app/Http/Controllers/NotificationController.php:140
 * @route '/notifications/schedules'
 */
export const storeSchedule = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeSchedule.url(options),
    method: 'post',
})

storeSchedule.definition = {
    methods: ["post"],
    url: '/notifications/schedules',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\NotificationController::storeSchedule
 * @see app/Http/Controllers/NotificationController.php:140
 * @route '/notifications/schedules'
 */
storeSchedule.url = (options?: RouteQueryOptions) => {
    return storeSchedule.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\NotificationController::storeSchedule
 * @see app/Http/Controllers/NotificationController.php:140
 * @route '/notifications/schedules'
 */
storeSchedule.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeSchedule.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\NotificationController::storeSchedule
 * @see app/Http/Controllers/NotificationController.php:140
 * @route '/notifications/schedules'
 */
    const storeScheduleForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: storeSchedule.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\NotificationController::storeSchedule
 * @see app/Http/Controllers/NotificationController.php:140
 * @route '/notifications/schedules'
 */
        storeScheduleForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: storeSchedule.url(options),
            method: 'post',
        })
    
    storeSchedule.form = storeScheduleForm
/**
* @see \App\Http\Controllers\NotificationController::updateSchedule
 * @see app/Http/Controllers/NotificationController.php:161
 * @route '/notifications/schedules/{id}'
 */
export const updateSchedule = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateSchedule.url(args, options),
    method: 'patch',
})

updateSchedule.definition = {
    methods: ["patch"],
    url: '/notifications/schedules/{id}',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\NotificationController::updateSchedule
 * @see app/Http/Controllers/NotificationController.php:161
 * @route '/notifications/schedules/{id}'
 */
updateSchedule.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return updateSchedule.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\NotificationController::updateSchedule
 * @see app/Http/Controllers/NotificationController.php:161
 * @route '/notifications/schedules/{id}'
 */
updateSchedule.patch = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateSchedule.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\NotificationController::updateSchedule
 * @see app/Http/Controllers/NotificationController.php:161
 * @route '/notifications/schedules/{id}'
 */
    const updateScheduleForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateSchedule.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\NotificationController::updateSchedule
 * @see app/Http/Controllers/NotificationController.php:161
 * @route '/notifications/schedules/{id}'
 */
        updateScheduleForm.patch = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateSchedule.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateSchedule.form = updateScheduleForm
/**
* @see \App\Http\Controllers\NotificationController::toggleSchedule
 * @see app/Http/Controllers/NotificationController.php:185
 * @route '/notifications/schedules/{id}/toggle'
 */
export const toggleSchedule = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: toggleSchedule.url(args, options),
    method: 'patch',
})

toggleSchedule.definition = {
    methods: ["patch"],
    url: '/notifications/schedules/{id}/toggle',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\NotificationController::toggleSchedule
 * @see app/Http/Controllers/NotificationController.php:185
 * @route '/notifications/schedules/{id}/toggle'
 */
toggleSchedule.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return toggleSchedule.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\NotificationController::toggleSchedule
 * @see app/Http/Controllers/NotificationController.php:185
 * @route '/notifications/schedules/{id}/toggle'
 */
toggleSchedule.patch = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: toggleSchedule.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\NotificationController::toggleSchedule
 * @see app/Http/Controllers/NotificationController.php:185
 * @route '/notifications/schedules/{id}/toggle'
 */
    const toggleScheduleForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: toggleSchedule.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\NotificationController::toggleSchedule
 * @see app/Http/Controllers/NotificationController.php:185
 * @route '/notifications/schedules/{id}/toggle'
 */
        toggleScheduleForm.patch = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: toggleSchedule.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    toggleSchedule.form = toggleScheduleForm
/**
* @see \App\Http\Controllers\NotificationController::destroySchedule
 * @see app/Http/Controllers/NotificationController.php:196
 * @route '/notifications/schedules/{id}'
 */
export const destroySchedule = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroySchedule.url(args, options),
    method: 'delete',
})

destroySchedule.definition = {
    methods: ["delete"],
    url: '/notifications/schedules/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\NotificationController::destroySchedule
 * @see app/Http/Controllers/NotificationController.php:196
 * @route '/notifications/schedules/{id}'
 */
destroySchedule.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return destroySchedule.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\NotificationController::destroySchedule
 * @see app/Http/Controllers/NotificationController.php:196
 * @route '/notifications/schedules/{id}'
 */
destroySchedule.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroySchedule.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\NotificationController::destroySchedule
 * @see app/Http/Controllers/NotificationController.php:196
 * @route '/notifications/schedules/{id}'
 */
    const destroyScheduleForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroySchedule.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\NotificationController::destroySchedule
 * @see app/Http/Controllers/NotificationController.php:196
 * @route '/notifications/schedules/{id}'
 */
        destroyScheduleForm.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroySchedule.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroySchedule.form = destroyScheduleForm
const NotificationController = { index, store, destroy, storeSchedule, updateSchedule, toggleSchedule, destroySchedule }

export default NotificationController