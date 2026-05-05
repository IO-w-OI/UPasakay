import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\LiveMapController::index
 * @see app/Http/Controllers/LiveMapController.php:12
 * @route '/live-map'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/live-map',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\LiveMapController::index
 * @see app/Http/Controllers/LiveMapController.php:12
 * @route '/live-map'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\LiveMapController::index
 * @see app/Http/Controllers/LiveMapController.php:12
 * @route '/live-map'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\LiveMapController::index
 * @see app/Http/Controllers/LiveMapController.php:12
 * @route '/live-map'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\LiveMapController::index
 * @see app/Http/Controllers/LiveMapController.php:12
 * @route '/live-map'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\LiveMapController::index
 * @see app/Http/Controllers/LiveMapController.php:12
 * @route '/live-map'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\LiveMapController::index
 * @see app/Http/Controllers/LiveMapController.php:12
 * @route '/live-map'
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
const LiveMapController = { index }

export default LiveMapController