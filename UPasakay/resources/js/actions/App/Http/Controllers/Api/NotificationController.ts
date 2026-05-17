import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\NotificationController::stats
 * @see app/Http/Controllers/Api/NotificationController.php:146
 * @route '/api/notifications/stats'
 */
export const stats = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stats.url(options),
    method: 'get',
})

stats.definition = {
    methods: ["get","head"],
    url: '/api/notifications/stats',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\NotificationController::stats
 * @see app/Http/Controllers/Api/NotificationController.php:146
 * @route '/api/notifications/stats'
 */
stats.url = (options?: RouteQueryOptions) => {
    return stats.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\NotificationController::stats
 * @see app/Http/Controllers/Api/NotificationController.php:146
 * @route '/api/notifications/stats'
 */
stats.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: stats.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\NotificationController::stats
 * @see app/Http/Controllers/Api/NotificationController.php:146
 * @route '/api/notifications/stats'
 */
stats.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: stats.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\NotificationController::stats
 * @see app/Http/Controllers/Api/NotificationController.php:146
 * @route '/api/notifications/stats'
 */
    const statsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: stats.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\NotificationController::stats
 * @see app/Http/Controllers/Api/NotificationController.php:146
 * @route '/api/notifications/stats'
 */
        statsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: stats.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\NotificationController::stats
 * @see app/Http/Controllers/Api/NotificationController.php:146
 * @route '/api/notifications/stats'
 */
        statsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: stats.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    stats.form = statsForm
/**
* @see \App\Http\Controllers\Api\NotificationController::scheduled
 * @see app/Http/Controllers/Api/NotificationController.php:125
 * @route '/api/notifications/scheduled'
 */
export const scheduled = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: scheduled.url(options),
    method: 'get',
})

scheduled.definition = {
    methods: ["get","head"],
    url: '/api/notifications/scheduled',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\NotificationController::scheduled
 * @see app/Http/Controllers/Api/NotificationController.php:125
 * @route '/api/notifications/scheduled'
 */
scheduled.url = (options?: RouteQueryOptions) => {
    return scheduled.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\NotificationController::scheduled
 * @see app/Http/Controllers/Api/NotificationController.php:125
 * @route '/api/notifications/scheduled'
 */
scheduled.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: scheduled.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\NotificationController::scheduled
 * @see app/Http/Controllers/Api/NotificationController.php:125
 * @route '/api/notifications/scheduled'
 */
scheduled.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: scheduled.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\NotificationController::scheduled
 * @see app/Http/Controllers/Api/NotificationController.php:125
 * @route '/api/notifications/scheduled'
 */
    const scheduledForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: scheduled.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\NotificationController::scheduled
 * @see app/Http/Controllers/Api/NotificationController.php:125
 * @route '/api/notifications/scheduled'
 */
        scheduledForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: scheduled.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\NotificationController::scheduled
 * @see app/Http/Controllers/Api/NotificationController.php:125
 * @route '/api/notifications/scheduled'
 */
        scheduledForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: scheduled.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    scheduled.form = scheduledForm
/**
* @see \App\Http\Controllers\Api\NotificationController::processScheduledNotifications
 * @see app/Http/Controllers/Api/NotificationController.php:132
 * @route '/api/notifications/process-scheduled'
 */
export const processScheduledNotifications = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: processScheduledNotifications.url(options),
    method: 'post',
})

processScheduledNotifications.definition = {
    methods: ["post"],
    url: '/api/notifications/process-scheduled',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\NotificationController::processScheduledNotifications
 * @see app/Http/Controllers/Api/NotificationController.php:132
 * @route '/api/notifications/process-scheduled'
 */
processScheduledNotifications.url = (options?: RouteQueryOptions) => {
    return processScheduledNotifications.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\NotificationController::processScheduledNotifications
 * @see app/Http/Controllers/Api/NotificationController.php:132
 * @route '/api/notifications/process-scheduled'
 */
processScheduledNotifications.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: processScheduledNotifications.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\NotificationController::processScheduledNotifications
 * @see app/Http/Controllers/Api/NotificationController.php:132
 * @route '/api/notifications/process-scheduled'
 */
    const processScheduledNotificationsForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: processScheduledNotifications.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\NotificationController::processScheduledNotifications
 * @see app/Http/Controllers/Api/NotificationController.php:132
 * @route '/api/notifications/process-scheduled'
 */
        processScheduledNotificationsForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: processScheduledNotifications.url(options),
            method: 'post',
        })
    
    processScheduledNotifications.form = processScheduledNotificationsForm
/**
* @see \App\Http\Controllers\Api\NotificationController::index
 * @see app/Http/Controllers/Api/NotificationController.php:17
 * @route '/api/notifications'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/notifications',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\NotificationController::index
 * @see app/Http/Controllers/Api/NotificationController.php:17
 * @route '/api/notifications'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\NotificationController::index
 * @see app/Http/Controllers/Api/NotificationController.php:17
 * @route '/api/notifications'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\NotificationController::index
 * @see app/Http/Controllers/Api/NotificationController.php:17
 * @route '/api/notifications'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\NotificationController::index
 * @see app/Http/Controllers/Api/NotificationController.php:17
 * @route '/api/notifications'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\NotificationController::index
 * @see app/Http/Controllers/Api/NotificationController.php:17
 * @route '/api/notifications'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\NotificationController::index
 * @see app/Http/Controllers/Api/NotificationController.php:17
 * @route '/api/notifications'
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
* @see \App\Http\Controllers\Api\NotificationController::store
 * @see app/Http/Controllers/Api/NotificationController.php:38
 * @route '/api/notifications'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/notifications',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\NotificationController::store
 * @see app/Http/Controllers/Api/NotificationController.php:38
 * @route '/api/notifications'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\NotificationController::store
 * @see app/Http/Controllers/Api/NotificationController.php:38
 * @route '/api/notifications'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\NotificationController::store
 * @see app/Http/Controllers/Api/NotificationController.php:38
 * @route '/api/notifications'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\NotificationController::store
 * @see app/Http/Controllers/Api/NotificationController.php:38
 * @route '/api/notifications'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Api\NotificationController::show
 * @see app/Http/Controllers/Api/NotificationController.php:57
 * @route '/api/notifications/{notification}'
 */
export const show = (args: { notification: number | { id: number } } | [notification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/notifications/{notification}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\NotificationController::show
 * @see app/Http/Controllers/Api/NotificationController.php:57
 * @route '/api/notifications/{notification}'
 */
show.url = (args: { notification: number | { id: number } } | [notification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { notification: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { notification: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    notification: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        notification: typeof args.notification === 'object'
                ? args.notification.id
                : args.notification,
                }

    return show.definition.url
            .replace('{notification}', parsedArgs.notification.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\NotificationController::show
 * @see app/Http/Controllers/Api/NotificationController.php:57
 * @route '/api/notifications/{notification}'
 */
show.get = (args: { notification: number | { id: number } } | [notification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\NotificationController::show
 * @see app/Http/Controllers/Api/NotificationController.php:57
 * @route '/api/notifications/{notification}'
 */
show.head = (args: { notification: number | { id: number } } | [notification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\NotificationController::show
 * @see app/Http/Controllers/Api/NotificationController.php:57
 * @route '/api/notifications/{notification}'
 */
    const showForm = (args: { notification: number | { id: number } } | [notification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\NotificationController::show
 * @see app/Http/Controllers/Api/NotificationController.php:57
 * @route '/api/notifications/{notification}'
 */
        showForm.get = (args: { notification: number | { id: number } } | [notification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\NotificationController::show
 * @see app/Http/Controllers/Api/NotificationController.php:57
 * @route '/api/notifications/{notification}'
 */
        showForm.head = (args: { notification: number | { id: number } } | [notification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Api\NotificationController::update
 * @see app/Http/Controllers/Api/NotificationController.php:62
 * @route '/api/notifications/{notification}'
 */
export const update = (args: { notification: number | { id: number } } | [notification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/api/notifications/{notification}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Api\NotificationController::update
 * @see app/Http/Controllers/Api/NotificationController.php:62
 * @route '/api/notifications/{notification}'
 */
update.url = (args: { notification: number | { id: number } } | [notification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { notification: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { notification: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    notification: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        notification: typeof args.notification === 'object'
                ? args.notification.id
                : args.notification,
                }

    return update.definition.url
            .replace('{notification}', parsedArgs.notification.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\NotificationController::update
 * @see app/Http/Controllers/Api/NotificationController.php:62
 * @route '/api/notifications/{notification}'
 */
update.put = (args: { notification: number | { id: number } } | [notification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Api\NotificationController::update
 * @see app/Http/Controllers/Api/NotificationController.php:62
 * @route '/api/notifications/{notification}'
 */
update.patch = (args: { notification: number | { id: number } } | [notification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Api\NotificationController::update
 * @see app/Http/Controllers/Api/NotificationController.php:62
 * @route '/api/notifications/{notification}'
 */
    const updateForm = (args: { notification: number | { id: number } } | [notification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\NotificationController::update
 * @see app/Http/Controllers/Api/NotificationController.php:62
 * @route '/api/notifications/{notification}'
 */
        updateForm.put = (args: { notification: number | { id: number } } | [notification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\Api\NotificationController::update
 * @see app/Http/Controllers/Api/NotificationController.php:62
 * @route '/api/notifications/{notification}'
 */
        updateForm.patch = (args: { notification: number | { id: number } } | [notification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Api\NotificationController::destroy
 * @see app/Http/Controllers/Api/NotificationController.php:82
 * @route '/api/notifications/{notification}'
 */
export const destroy = (args: { notification: number | { id: number } } | [notification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/notifications/{notification}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\NotificationController::destroy
 * @see app/Http/Controllers/Api/NotificationController.php:82
 * @route '/api/notifications/{notification}'
 */
destroy.url = (args: { notification: number | { id: number } } | [notification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { notification: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { notification: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    notification: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        notification: typeof args.notification === 'object'
                ? args.notification.id
                : args.notification,
                }

    return destroy.definition.url
            .replace('{notification}', parsedArgs.notification.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\NotificationController::destroy
 * @see app/Http/Controllers/Api/NotificationController.php:82
 * @route '/api/notifications/{notification}'
 */
destroy.delete = (args: { notification: number | { id: number } } | [notification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Api\NotificationController::destroy
 * @see app/Http/Controllers/Api/NotificationController.php:82
 * @route '/api/notifications/{notification}'
 */
    const destroyForm = (args: { notification: number | { id: number } } | [notification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\NotificationController::destroy
 * @see app/Http/Controllers/Api/NotificationController.php:82
 * @route '/api/notifications/{notification}'
 */
        destroyForm.delete = (args: { notification: number | { id: number } } | [notification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Api\NotificationController::send
 * @see app/Http/Controllers/Api/NotificationController.php:103
 * @route '/api/notifications/{notification}/send'
 */
export const send = (args: { notification: number | { id: number } } | [notification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(args, options),
    method: 'post',
})

send.definition = {
    methods: ["post"],
    url: '/api/notifications/{notification}/send',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\NotificationController::send
 * @see app/Http/Controllers/Api/NotificationController.php:103
 * @route '/api/notifications/{notification}/send'
 */
send.url = (args: { notification: number | { id: number } } | [notification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { notification: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { notification: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    notification: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        notification: typeof args.notification === 'object'
                ? args.notification.id
                : args.notification,
                }

    return send.definition.url
            .replace('{notification}', parsedArgs.notification.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\NotificationController::send
 * @see app/Http/Controllers/Api/NotificationController.php:103
 * @route '/api/notifications/{notification}/send'
 */
send.post = (args: { notification: number | { id: number } } | [notification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\NotificationController::send
 * @see app/Http/Controllers/Api/NotificationController.php:103
 * @route '/api/notifications/{notification}/send'
 */
    const sendForm = (args: { notification: number | { id: number } } | [notification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: send.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\NotificationController::send
 * @see app/Http/Controllers/Api/NotificationController.php:103
 * @route '/api/notifications/{notification}/send'
 */
        sendForm.post = (args: { notification: number | { id: number } } | [notification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: send.url(args, options),
            method: 'post',
        })
    
    send.form = sendForm
/**
* @see \App\Http\Controllers\Api\NotificationController::schedule
 * @see app/Http/Controllers/Api/NotificationController.php:89
 * @route '/api/notifications/{notification}/schedule'
 */
export const schedule = (args: { notification: number | { id: number } } | [notification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: schedule.url(args, options),
    method: 'post',
})

schedule.definition = {
    methods: ["post"],
    url: '/api/notifications/{notification}/schedule',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\NotificationController::schedule
 * @see app/Http/Controllers/Api/NotificationController.php:89
 * @route '/api/notifications/{notification}/schedule'
 */
schedule.url = (args: { notification: number | { id: number } } | [notification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { notification: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { notification: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    notification: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        notification: typeof args.notification === 'object'
                ? args.notification.id
                : args.notification,
                }

    return schedule.definition.url
            .replace('{notification}', parsedArgs.notification.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\NotificationController::schedule
 * @see app/Http/Controllers/Api/NotificationController.php:89
 * @route '/api/notifications/{notification}/schedule'
 */
schedule.post = (args: { notification: number | { id: number } } | [notification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: schedule.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\NotificationController::schedule
 * @see app/Http/Controllers/Api/NotificationController.php:89
 * @route '/api/notifications/{notification}/schedule'
 */
    const scheduleForm = (args: { notification: number | { id: number } } | [notification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: schedule.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\NotificationController::schedule
 * @see app/Http/Controllers/Api/NotificationController.php:89
 * @route '/api/notifications/{notification}/schedule'
 */
        scheduleForm.post = (args: { notification: number | { id: number } } | [notification: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: schedule.url(args, options),
            method: 'post',
        })
    
    schedule.form = scheduleForm
const NotificationController = { stats, scheduled, processScheduledNotifications, index, store, show, update, destroy, send, schedule }

export default NotificationController