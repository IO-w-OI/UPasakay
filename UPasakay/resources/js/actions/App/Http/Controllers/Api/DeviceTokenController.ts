import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\DeviceTokenController::store
 * @see app/Http/Controllers/Api/DeviceTokenController.php:21
 * @route '/api/device-tokens'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/device-tokens',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\DeviceTokenController::store
 * @see app/Http/Controllers/Api/DeviceTokenController.php:21
 * @route '/api/device-tokens'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeviceTokenController::store
 * @see app/Http/Controllers/Api/DeviceTokenController.php:21
 * @route '/api/device-tokens'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\DeviceTokenController::store
 * @see app/Http/Controllers/Api/DeviceTokenController.php:21
 * @route '/api/device-tokens'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\DeviceTokenController::store
 * @see app/Http/Controllers/Api/DeviceTokenController.php:21
 * @route '/api/device-tokens'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Api\DeviceTokenController::destroy
 * @see app/Http/Controllers/Api/DeviceTokenController.php:49
 * @route '/api/device-tokens'
 */
export const destroy = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/device-tokens',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\DeviceTokenController::destroy
 * @see app/Http/Controllers/Api/DeviceTokenController.php:49
 * @route '/api/device-tokens'
 */
destroy.url = (options?: RouteQueryOptions) => {
    return destroy.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\DeviceTokenController::destroy
 * @see app/Http/Controllers/Api/DeviceTokenController.php:49
 * @route '/api/device-tokens'
 */
destroy.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Api\DeviceTokenController::destroy
 * @see app/Http/Controllers/Api/DeviceTokenController.php:49
 * @route '/api/device-tokens'
 */
    const destroyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url({
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\DeviceTokenController::destroy
 * @see app/Http/Controllers/Api/DeviceTokenController.php:49
 * @route '/api/device-tokens'
 */
        destroyForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const DeviceTokenController = { store, destroy }

export default DeviceTokenController