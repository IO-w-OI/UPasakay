import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
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
const LiveMapController = { index }

export default LiveMapController