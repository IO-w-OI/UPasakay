import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\FeedbackController::index
 * @see app/Http/Controllers/FeedbackController.php:15
 * @route '/feedback'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/feedback',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\FeedbackController::index
 * @see app/Http/Controllers/FeedbackController.php:15
 * @route '/feedback'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\FeedbackController::index
 * @see app/Http/Controllers/FeedbackController.php:15
 * @route '/feedback'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\FeedbackController::index
 * @see app/Http/Controllers/FeedbackController.php:15
 * @route '/feedback'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\FeedbackController::index
 * @see app/Http/Controllers/FeedbackController.php:15
 * @route '/feedback'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\FeedbackController::index
 * @see app/Http/Controllers/FeedbackController.php:15
 * @route '/feedback'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\FeedbackController::index
 * @see app/Http/Controllers/FeedbackController.php:15
 * @route '/feedback'
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
const FeedbackController = { index }

export default FeedbackController