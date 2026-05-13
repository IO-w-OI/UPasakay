import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\AdminController::index
 * @see app/Http/Controllers/AdminController.php:17
 * @route '/admins'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admins',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AdminController::index
 * @see app/Http/Controllers/AdminController.php:17
 * @route '/admins'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdminController::index
 * @see app/Http/Controllers/AdminController.php:17
 * @route '/admins'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\AdminController::index
 * @see app/Http/Controllers/AdminController.php:17
 * @route '/admins'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\AdminController::index
 * @see app/Http/Controllers/AdminController.php:17
 * @route '/admins'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\AdminController::index
 * @see app/Http/Controllers/AdminController.php:17
 * @route '/admins'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\AdminController::index
 * @see app/Http/Controllers/AdminController.php:17
 * @route '/admins'
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
* @see \App\Http\Controllers\AdminController::create
 * @see app/Http/Controllers/AdminController.php:64
 * @route '/admins/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admins/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AdminController::create
 * @see app/Http/Controllers/AdminController.php:64
 * @route '/admins/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdminController::create
 * @see app/Http/Controllers/AdminController.php:64
 * @route '/admins/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\AdminController::create
 * @see app/Http/Controllers/AdminController.php:64
 * @route '/admins/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\AdminController::create
 * @see app/Http/Controllers/AdminController.php:64
 * @route '/admins/create'
 */
    const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\AdminController::create
 * @see app/Http/Controllers/AdminController.php:64
 * @route '/admins/create'
 */
        createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\AdminController::create
 * @see app/Http/Controllers/AdminController.php:64
 * @route '/admins/create'
 */
        createForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    create.form = createForm
/**
* @see \App\Http\Controllers\AdminController::store
 * @see app/Http/Controllers/AdminController.php:74
 * @route '/admins'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admins',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AdminController::store
 * @see app/Http/Controllers/AdminController.php:74
 * @route '/admins'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdminController::store
 * @see app/Http/Controllers/AdminController.php:74
 * @route '/admins'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\AdminController::store
 * @see app/Http/Controllers/AdminController.php:74
 * @route '/admins'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AdminController::store
 * @see app/Http/Controllers/AdminController.php:74
 * @route '/admins'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\AdminController::edit
 * @see app/Http/Controllers/AdminController.php:116
 * @route '/admins/{admin}/edit'
 */
export const edit = (args: { admin: number | { user_id: number } } | [admin: number | { user_id: number } ] | number | { user_id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admins/{admin}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AdminController::edit
 * @see app/Http/Controllers/AdminController.php:116
 * @route '/admins/{admin}/edit'
 */
edit.url = (args: { admin: number | { user_id: number } } | [admin: number | { user_id: number } ] | number | { user_id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { admin: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'user_id' in args) {
            args = { admin: args.user_id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    admin: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        admin: typeof args.admin === 'object'
                ? args.admin.user_id
                : args.admin,
                }

    return edit.definition.url
            .replace('{admin}', parsedArgs.admin.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdminController::edit
 * @see app/Http/Controllers/AdminController.php:116
 * @route '/admins/{admin}/edit'
 */
edit.get = (args: { admin: number | { user_id: number } } | [admin: number | { user_id: number } ] | number | { user_id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\AdminController::edit
 * @see app/Http/Controllers/AdminController.php:116
 * @route '/admins/{admin}/edit'
 */
edit.head = (args: { admin: number | { user_id: number } } | [admin: number | { user_id: number } ] | number | { user_id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\AdminController::edit
 * @see app/Http/Controllers/AdminController.php:116
 * @route '/admins/{admin}/edit'
 */
    const editForm = (args: { admin: number | { user_id: number } } | [admin: number | { user_id: number } ] | number | { user_id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: edit.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\AdminController::edit
 * @see app/Http/Controllers/AdminController.php:116
 * @route '/admins/{admin}/edit'
 */
        editForm.get = (args: { admin: number | { user_id: number } } | [admin: number | { user_id: number } ] | number | { user_id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\AdminController::edit
 * @see app/Http/Controllers/AdminController.php:116
 * @route '/admins/{admin}/edit'
 */
        editForm.head = (args: { admin: number | { user_id: number } } | [admin: number | { user_id: number } ] | number | { user_id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    edit.form = editForm
/**
* @see \App\Http\Controllers\AdminController::update
 * @see app/Http/Controllers/AdminController.php:134
 * @route '/admins/{admin}'
 */
export const update = (args: { admin: number | { user_id: number } } | [admin: number | { user_id: number } ] | number | { user_id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/admins/{admin}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\AdminController::update
 * @see app/Http/Controllers/AdminController.php:134
 * @route '/admins/{admin}'
 */
update.url = (args: { admin: number | { user_id: number } } | [admin: number | { user_id: number } ] | number | { user_id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { admin: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'user_id' in args) {
            args = { admin: args.user_id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    admin: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        admin: typeof args.admin === 'object'
                ? args.admin.user_id
                : args.admin,
                }

    return update.definition.url
            .replace('{admin}', parsedArgs.admin.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdminController::update
 * @see app/Http/Controllers/AdminController.php:134
 * @route '/admins/{admin}'
 */
update.put = (args: { admin: number | { user_id: number } } | [admin: number | { user_id: number } ] | number | { user_id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\AdminController::update
 * @see app/Http/Controllers/AdminController.php:134
 * @route '/admins/{admin}'
 */
update.patch = (args: { admin: number | { user_id: number } } | [admin: number | { user_id: number } ] | number | { user_id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\AdminController::update
 * @see app/Http/Controllers/AdminController.php:134
 * @route '/admins/{admin}'
 */
    const updateForm = (args: { admin: number | { user_id: number } } | [admin: number | { user_id: number } ] | number | { user_id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AdminController::update
 * @see app/Http/Controllers/AdminController.php:134
 * @route '/admins/{admin}'
 */
        updateForm.put = (args: { admin: number | { user_id: number } } | [admin: number | { user_id: number } ] | number | { user_id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\AdminController::update
 * @see app/Http/Controllers/AdminController.php:134
 * @route '/admins/{admin}'
 */
        updateForm.patch = (args: { admin: number | { user_id: number } } | [admin: number | { user_id: number } ] | number | { user_id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\AdminController::destroy
 * @see app/Http/Controllers/AdminController.php:166
 * @route '/admins/{admin}'
 */
export const destroy = (args: { admin: number | { user_id: number } } | [admin: number | { user_id: number } ] | number | { user_id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admins/{admin}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\AdminController::destroy
 * @see app/Http/Controllers/AdminController.php:166
 * @route '/admins/{admin}'
 */
destroy.url = (args: { admin: number | { user_id: number } } | [admin: number | { user_id: number } ] | number | { user_id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { admin: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'user_id' in args) {
            args = { admin: args.user_id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    admin: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        admin: typeof args.admin === 'object'
                ? args.admin.user_id
                : args.admin,
                }

    return destroy.definition.url
            .replace('{admin}', parsedArgs.admin.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdminController::destroy
 * @see app/Http/Controllers/AdminController.php:166
 * @route '/admins/{admin}'
 */
destroy.delete = (args: { admin: number | { user_id: number } } | [admin: number | { user_id: number } ] | number | { user_id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\AdminController::destroy
 * @see app/Http/Controllers/AdminController.php:166
 * @route '/admins/{admin}'
 */
    const destroyForm = (args: { admin: number | { user_id: number } } | [admin: number | { user_id: number } ] | number | { user_id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AdminController::destroy
 * @see app/Http/Controllers/AdminController.php:166
 * @route '/admins/{admin}'
 */
        destroyForm.delete = (args: { admin: number | { user_id: number } } | [admin: number | { user_id: number } ] | number | { user_id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const AdminController = { index, create, store, edit, update, destroy }

export default AdminController