import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\DriverApiController::setStatus
 * @see app/Http/Controllers/Api/DriverApiController.php:47
 * @route '/api/driver/status'
 */
export const setStatus = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: setStatus.url(options),
    method: 'patch',
})

setStatus.definition = {
    methods: ["patch"],
    url: '/api/driver/status',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Api\DriverApiController::setStatus
 * @see app/Http/Controllers/Api/DriverApiController.php:47
 * @route '/api/driver/status'
 */
setStatus.url = (options?: RouteQueryOptions) => {
    return setStatus.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DriverApiController::setStatus
 * @see app/Http/Controllers/Api/DriverApiController.php:47
 * @route '/api/driver/status'
 */
setStatus.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: setStatus.url(options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Api\DriverApiController::setStatus
 * @see app/Http/Controllers/Api/DriverApiController.php:47
 * @route '/api/driver/status'
 */
    const setStatusForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: setStatus.url({
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\DriverApiController::setStatus
 * @see app/Http/Controllers/Api/DriverApiController.php:47
 * @route '/api/driver/status'
 */
        setStatusForm.patch = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: setStatus.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    setStatus.form = setStatusForm
/**
* @see \App\Http\Controllers\Api\DriverApiController::queue
 * @see app/Http/Controllers/Api/DriverApiController.php:85
 * @route '/api/driver/queue'
 */
export const queue = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: queue.url(options),
    method: 'get',
})

queue.definition = {
    methods: ["get","head"],
    url: '/api/driver/queue',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\DriverApiController::queue
 * @see app/Http/Controllers/Api/DriverApiController.php:85
 * @route '/api/driver/queue'
 */
queue.url = (options?: RouteQueryOptions) => {
    return queue.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DriverApiController::queue
 * @see app/Http/Controllers/Api/DriverApiController.php:85
 * @route '/api/driver/queue'
 */
queue.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: queue.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\DriverApiController::queue
 * @see app/Http/Controllers/Api/DriverApiController.php:85
 * @route '/api/driver/queue'
 */
queue.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: queue.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\DriverApiController::queue
 * @see app/Http/Controllers/Api/DriverApiController.php:85
 * @route '/api/driver/queue'
 */
    const queueForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: queue.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\DriverApiController::queue
 * @see app/Http/Controllers/Api/DriverApiController.php:85
 * @route '/api/driver/queue'
 */
        queueForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: queue.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\DriverApiController::queue
 * @see app/Http/Controllers/Api/DriverApiController.php:85
 * @route '/api/driver/queue'
 */
        queueForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: queue.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    queue.form = queueForm
/**
* @see \App\Http\Controllers\Api\DriverApiController::notifications
 * @see app/Http/Controllers/Api/DriverApiController.php:169
 * @route '/api/driver/notifications'
 */
export const notifications = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: notifications.url(options),
    method: 'get',
})

notifications.definition = {
    methods: ["get","head"],
    url: '/api/driver/notifications',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\DriverApiController::notifications
 * @see app/Http/Controllers/Api/DriverApiController.php:169
 * @route '/api/driver/notifications'
 */
notifications.url = (options?: RouteQueryOptions) => {
    return notifications.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DriverApiController::notifications
 * @see app/Http/Controllers/Api/DriverApiController.php:169
 * @route '/api/driver/notifications'
 */
notifications.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: notifications.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\DriverApiController::notifications
 * @see app/Http/Controllers/Api/DriverApiController.php:169
 * @route '/api/driver/notifications'
 */
notifications.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: notifications.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\DriverApiController::notifications
 * @see app/Http/Controllers/Api/DriverApiController.php:169
 * @route '/api/driver/notifications'
 */
    const notificationsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: notifications.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\DriverApiController::notifications
 * @see app/Http/Controllers/Api/DriverApiController.php:169
 * @route '/api/driver/notifications'
 */
        notificationsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: notifications.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\DriverApiController::notifications
 * @see app/Http/Controllers/Api/DriverApiController.php:169
 * @route '/api/driver/notifications'
 */
        notificationsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: notifications.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    notifications.form = notificationsForm
/**
* @see \App\Http\Controllers\Api\DriverApiController::board
 * @see app/Http/Controllers/Api/DriverApiController.php:202
 * @route '/api/pickup-requests/{pickupRequest}/board'
 */
export const board = (args: { pickupRequest: number | { id: number } } | [pickupRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: board.url(args, options),
    method: 'patch',
})

board.definition = {
    methods: ["patch"],
    url: '/api/pickup-requests/{pickupRequest}/board',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Api\DriverApiController::board
 * @see app/Http/Controllers/Api/DriverApiController.php:202
 * @route '/api/pickup-requests/{pickupRequest}/board'
 */
board.url = (args: { pickupRequest: number | { id: number } } | [pickupRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { pickupRequest: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { pickupRequest: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    pickupRequest: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        pickupRequest: typeof args.pickupRequest === 'object'
                ? args.pickupRequest.id
                : args.pickupRequest,
                }

    return board.definition.url
            .replace('{pickupRequest}', parsedArgs.pickupRequest.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DriverApiController::board
 * @see app/Http/Controllers/Api/DriverApiController.php:202
 * @route '/api/pickup-requests/{pickupRequest}/board'
 */
board.patch = (args: { pickupRequest: number | { id: number } } | [pickupRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: board.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Api\DriverApiController::board
 * @see app/Http/Controllers/Api/DriverApiController.php:202
 * @route '/api/pickup-requests/{pickupRequest}/board'
 */
    const boardForm = (args: { pickupRequest: number | { id: number } } | [pickupRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: board.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\DriverApiController::board
 * @see app/Http/Controllers/Api/DriverApiController.php:202
 * @route '/api/pickup-requests/{pickupRequest}/board'
 */
        boardForm.patch = (args: { pickupRequest: number | { id: number } } | [pickupRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: board.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    board.form = boardForm
/**
* @see \App\Http\Controllers\Api\DriverApiController::noShow
 * @see app/Http/Controllers/Api/DriverApiController.php:272
 * @route '/api/pickup-requests/{pickupRequest}/no-show'
 */
export const noShow = (args: { pickupRequest: number | { id: number } } | [pickupRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: noShow.url(args, options),
    method: 'patch',
})

noShow.definition = {
    methods: ["patch"],
    url: '/api/pickup-requests/{pickupRequest}/no-show',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Api\DriverApiController::noShow
 * @see app/Http/Controllers/Api/DriverApiController.php:272
 * @route '/api/pickup-requests/{pickupRequest}/no-show'
 */
noShow.url = (args: { pickupRequest: number | { id: number } } | [pickupRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { pickupRequest: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { pickupRequest: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    pickupRequest: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        pickupRequest: typeof args.pickupRequest === 'object'
                ? args.pickupRequest.id
                : args.pickupRequest,
                }

    return noShow.definition.url
            .replace('{pickupRequest}', parsedArgs.pickupRequest.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DriverApiController::noShow
 * @see app/Http/Controllers/Api/DriverApiController.php:272
 * @route '/api/pickup-requests/{pickupRequest}/no-show'
 */
noShow.patch = (args: { pickupRequest: number | { id: number } } | [pickupRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: noShow.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Api\DriverApiController::noShow
 * @see app/Http/Controllers/Api/DriverApiController.php:272
 * @route '/api/pickup-requests/{pickupRequest}/no-show'
 */
    const noShowForm = (args: { pickupRequest: number | { id: number } } | [pickupRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: noShow.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\DriverApiController::noShow
 * @see app/Http/Controllers/Api/DriverApiController.php:272
 * @route '/api/pickup-requests/{pickupRequest}/no-show'
 */
        noShowForm.patch = (args: { pickupRequest: number | { id: number } } | [pickupRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: noShow.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    noShow.form = noShowForm
/**
* @see \App\Http\Controllers\Api\DriverApiController::decline
 * @see app/Http/Controllers/Api/DriverApiController.php:280
 * @route '/api/pickup-requests/{pickupRequest}/decline'
 */
export const decline = (args: { pickupRequest: number | { id: number } } | [pickupRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: decline.url(args, options),
    method: 'patch',
})

decline.definition = {
    methods: ["patch"],
    url: '/api/pickup-requests/{pickupRequest}/decline',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Api\DriverApiController::decline
 * @see app/Http/Controllers/Api/DriverApiController.php:280
 * @route '/api/pickup-requests/{pickupRequest}/decline'
 */
decline.url = (args: { pickupRequest: number | { id: number } } | [pickupRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { pickupRequest: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { pickupRequest: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    pickupRequest: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        pickupRequest: typeof args.pickupRequest === 'object'
                ? args.pickupRequest.id
                : args.pickupRequest,
                }

    return decline.definition.url
            .replace('{pickupRequest}', parsedArgs.pickupRequest.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DriverApiController::decline
 * @see app/Http/Controllers/Api/DriverApiController.php:280
 * @route '/api/pickup-requests/{pickupRequest}/decline'
 */
decline.patch = (args: { pickupRequest: number | { id: number } } | [pickupRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: decline.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Api\DriverApiController::decline
 * @see app/Http/Controllers/Api/DriverApiController.php:280
 * @route '/api/pickup-requests/{pickupRequest}/decline'
 */
    const declineForm = (args: { pickupRequest: number | { id: number } } | [pickupRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: decline.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\DriverApiController::decline
 * @see app/Http/Controllers/Api/DriverApiController.php:280
 * @route '/api/pickup-requests/{pickupRequest}/decline'
 */
        declineForm.patch = (args: { pickupRequest: number | { id: number } } | [pickupRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: decline.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    decline.form = declineForm
/**
* @see \App\Http\Controllers\Api\DriverApiController::complete
 * @see app/Http/Controllers/Api/DriverApiController.php:229
 * @route '/api/pickup-requests/{pickupRequest}/complete'
 */
export const complete = (args: { pickupRequest: number | { id: number } } | [pickupRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: complete.url(args, options),
    method: 'patch',
})

complete.definition = {
    methods: ["patch"],
    url: '/api/pickup-requests/{pickupRequest}/complete',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Api\DriverApiController::complete
 * @see app/Http/Controllers/Api/DriverApiController.php:229
 * @route '/api/pickup-requests/{pickupRequest}/complete'
 */
complete.url = (args: { pickupRequest: number | { id: number } } | [pickupRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { pickupRequest: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { pickupRequest: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    pickupRequest: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        pickupRequest: typeof args.pickupRequest === 'object'
                ? args.pickupRequest.id
                : args.pickupRequest,
                }

    return complete.definition.url
            .replace('{pickupRequest}', parsedArgs.pickupRequest.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DriverApiController::complete
 * @see app/Http/Controllers/Api/DriverApiController.php:229
 * @route '/api/pickup-requests/{pickupRequest}/complete'
 */
complete.patch = (args: { pickupRequest: number | { id: number } } | [pickupRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: complete.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Api\DriverApiController::complete
 * @see app/Http/Controllers/Api/DriverApiController.php:229
 * @route '/api/pickup-requests/{pickupRequest}/complete'
 */
    const completeForm = (args: { pickupRequest: number | { id: number } } | [pickupRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: complete.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\DriverApiController::complete
 * @see app/Http/Controllers/Api/DriverApiController.php:229
 * @route '/api/pickup-requests/{pickupRequest}/complete'
 */
        completeForm.patch = (args: { pickupRequest: number | { id: number } } | [pickupRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: complete.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    complete.form = completeForm
const DriverApiController = { setStatus, queue, notifications, board, noShow, decline, complete }

export default DriverApiController