import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
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
const PickupRequestController = { exportMethod, index, export: exportMethod }

export default PickupRequestController