import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\AdminAuthController::register
 * @see app/Http/Controllers/Api/AdminAuthController.php:18
 * @route '/api/admin/register'
 */
export const register = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: register.url(options),
    method: 'post',
})

register.definition = {
    methods: ["post"],
    url: '/api/admin/register',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AdminAuthController::register
 * @see app/Http/Controllers/Api/AdminAuthController.php:18
 * @route '/api/admin/register'
 */
register.url = (options?: RouteQueryOptions) => {
    return register.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AdminAuthController::register
 * @see app/Http/Controllers/Api/AdminAuthController.php:18
 * @route '/api/admin/register'
 */
register.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: register.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\AdminAuthController::register
 * @see app/Http/Controllers/Api/AdminAuthController.php:18
 * @route '/api/admin/register'
 */
    const registerForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: register.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\AdminAuthController::register
 * @see app/Http/Controllers/Api/AdminAuthController.php:18
 * @route '/api/admin/register'
 */
        registerForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: register.url(options),
            method: 'post',
        })
    
    register.form = registerForm
const AdminAuthController = { register }

export default AdminAuthController