import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\PassengerProfileController::show
 * @see app/Http/Controllers/Api/PassengerProfileController.php:14
 * @route '/api/passenger/profile'
 */
const show08517a4a327c1de0feed568d635d8308 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show08517a4a327c1de0feed568d635d8308.url(options),
    method: 'get',
})

show08517a4a327c1de0feed568d635d8308.definition = {
    methods: ["get","head"],
    url: '/api/passenger/profile',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PassengerProfileController::show
 * @see app/Http/Controllers/Api/PassengerProfileController.php:14
 * @route '/api/passenger/profile'
 */
show08517a4a327c1de0feed568d635d8308.url = (options?: RouteQueryOptions) => {
    return show08517a4a327c1de0feed568d635d8308.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PassengerProfileController::show
 * @see app/Http/Controllers/Api/PassengerProfileController.php:14
 * @route '/api/passenger/profile'
 */
show08517a4a327c1de0feed568d635d8308.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show08517a4a327c1de0feed568d635d8308.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\PassengerProfileController::show
 * @see app/Http/Controllers/Api/PassengerProfileController.php:14
 * @route '/api/passenger/profile'
 */
show08517a4a327c1de0feed568d635d8308.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show08517a4a327c1de0feed568d635d8308.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\PassengerProfileController::show
 * @see app/Http/Controllers/Api/PassengerProfileController.php:14
 * @route '/api/mobile/me'
 */
const showe56fab198aab51bfb6b889f445a36cfa = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showe56fab198aab51bfb6b889f445a36cfa.url(options),
    method: 'get',
})

showe56fab198aab51bfb6b889f445a36cfa.definition = {
    methods: ["get","head"],
    url: '/api/mobile/me',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PassengerProfileController::show
 * @see app/Http/Controllers/Api/PassengerProfileController.php:14
 * @route '/api/mobile/me'
 */
showe56fab198aab51bfb6b889f445a36cfa.url = (options?: RouteQueryOptions) => {
    return showe56fab198aab51bfb6b889f445a36cfa.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PassengerProfileController::show
 * @see app/Http/Controllers/Api/PassengerProfileController.php:14
 * @route '/api/mobile/me'
 */
showe56fab198aab51bfb6b889f445a36cfa.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showe56fab198aab51bfb6b889f445a36cfa.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\PassengerProfileController::show
 * @see app/Http/Controllers/Api/PassengerProfileController.php:14
 * @route '/api/mobile/me'
 */
showe56fab198aab51bfb6b889f445a36cfa.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showe56fab198aab51bfb6b889f445a36cfa.url(options),
    method: 'head',
})

export const show = {
    '/api/passenger/profile': show08517a4a327c1de0feed568d635d8308,
    '/api/mobile/me': showe56fab198aab51bfb6b889f445a36cfa,
}

/**
* @see \App\Http\Controllers\Api\PassengerProfileController::update
 * @see app/Http/Controllers/Api/PassengerProfileController.php:24
 * @route '/api/passenger/profile'
 */
const update08517a4a327c1de0feed568d635d8308 = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update08517a4a327c1de0feed568d635d8308.url(options),
    method: 'patch',
})

update08517a4a327c1de0feed568d635d8308.definition = {
    methods: ["patch"],
    url: '/api/passenger/profile',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Api\PassengerProfileController::update
 * @see app/Http/Controllers/Api/PassengerProfileController.php:24
 * @route '/api/passenger/profile'
 */
update08517a4a327c1de0feed568d635d8308.url = (options?: RouteQueryOptions) => {
    return update08517a4a327c1de0feed568d635d8308.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PassengerProfileController::update
 * @see app/Http/Controllers/Api/PassengerProfileController.php:24
 * @route '/api/passenger/profile'
 */
update08517a4a327c1de0feed568d635d8308.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update08517a4a327c1de0feed568d635d8308.url(options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Api\PassengerProfileController::update
 * @see app/Http/Controllers/Api/PassengerProfileController.php:24
 * @route '/api/mobile/profile'
 */
const update4ac25738699ce4f53da49524d36e99db = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update4ac25738699ce4f53da49524d36e99db.url(options),
    method: 'patch',
})

update4ac25738699ce4f53da49524d36e99db.definition = {
    methods: ["patch"],
    url: '/api/mobile/profile',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Api\PassengerProfileController::update
 * @see app/Http/Controllers/Api/PassengerProfileController.php:24
 * @route '/api/mobile/profile'
 */
update4ac25738699ce4f53da49524d36e99db.url = (options?: RouteQueryOptions) => {
    return update4ac25738699ce4f53da49524d36e99db.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PassengerProfileController::update
 * @see app/Http/Controllers/Api/PassengerProfileController.php:24
 * @route '/api/mobile/profile'
 */
update4ac25738699ce4f53da49524d36e99db.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update4ac25738699ce4f53da49524d36e99db.url(options),
    method: 'patch',
})

export const update = {
    '/api/passenger/profile': update08517a4a327c1de0feed568d635d8308,
    '/api/mobile/profile': update4ac25738699ce4f53da49524d36e99db,
}

/**
* @see \App\Http\Controllers\Api\PassengerProfileController::complete
 * @see app/Http/Controllers/Api/PassengerProfileController.php:40
 * @route '/api/passenger/profile/complete'
 */
const completefff6ab0c1f0c2e229ee86966945926b5 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: completefff6ab0c1f0c2e229ee86966945926b5.url(options),
    method: 'post',
})

completefff6ab0c1f0c2e229ee86966945926b5.definition = {
    methods: ["post"],
    url: '/api/passenger/profile/complete',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\PassengerProfileController::complete
 * @see app/Http/Controllers/Api/PassengerProfileController.php:40
 * @route '/api/passenger/profile/complete'
 */
completefff6ab0c1f0c2e229ee86966945926b5.url = (options?: RouteQueryOptions) => {
    return completefff6ab0c1f0c2e229ee86966945926b5.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PassengerProfileController::complete
 * @see app/Http/Controllers/Api/PassengerProfileController.php:40
 * @route '/api/passenger/profile/complete'
 */
completefff6ab0c1f0c2e229ee86966945926b5.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: completefff6ab0c1f0c2e229ee86966945926b5.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\PassengerProfileController::complete
 * @see app/Http/Controllers/Api/PassengerProfileController.php:40
 * @route '/api/mobile/profile/complete'
 */
const complete5cf23bf7daf1cf2466dd7cf6ecdf51ad = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: complete5cf23bf7daf1cf2466dd7cf6ecdf51ad.url(options),
    method: 'post',
})

complete5cf23bf7daf1cf2466dd7cf6ecdf51ad.definition = {
    methods: ["post"],
    url: '/api/mobile/profile/complete',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\PassengerProfileController::complete
 * @see app/Http/Controllers/Api/PassengerProfileController.php:40
 * @route '/api/mobile/profile/complete'
 */
complete5cf23bf7daf1cf2466dd7cf6ecdf51ad.url = (options?: RouteQueryOptions) => {
    return complete5cf23bf7daf1cf2466dd7cf6ecdf51ad.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PassengerProfileController::complete
 * @see app/Http/Controllers/Api/PassengerProfileController.php:40
 * @route '/api/mobile/profile/complete'
 */
complete5cf23bf7daf1cf2466dd7cf6ecdf51ad.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: complete5cf23bf7daf1cf2466dd7cf6ecdf51ad.url(options),
    method: 'post',
})

export const complete = {
    '/api/passenger/profile/complete': completefff6ab0c1f0c2e229ee86966945926b5,
    '/api/mobile/profile/complete': complete5cf23bf7daf1cf2466dd7cf6ecdf51ad,
}

/**
* @see \App\Http\Controllers\Api\PassengerProfileController::verification
 * @see app/Http/Controllers/Api/PassengerProfileController.php:56
 * @route '/api/passenger/profile/verification'
 */
const verificationa8a41ea8312f1190d8d560bd7fd5a000 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verificationa8a41ea8312f1190d8d560bd7fd5a000.url(options),
    method: 'get',
})

verificationa8a41ea8312f1190d8d560bd7fd5a000.definition = {
    methods: ["get","head"],
    url: '/api/passenger/profile/verification',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PassengerProfileController::verification
 * @see app/Http/Controllers/Api/PassengerProfileController.php:56
 * @route '/api/passenger/profile/verification'
 */
verificationa8a41ea8312f1190d8d560bd7fd5a000.url = (options?: RouteQueryOptions) => {
    return verificationa8a41ea8312f1190d8d560bd7fd5a000.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PassengerProfileController::verification
 * @see app/Http/Controllers/Api/PassengerProfileController.php:56
 * @route '/api/passenger/profile/verification'
 */
verificationa8a41ea8312f1190d8d560bd7fd5a000.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verificationa8a41ea8312f1190d8d560bd7fd5a000.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\PassengerProfileController::verification
 * @see app/Http/Controllers/Api/PassengerProfileController.php:56
 * @route '/api/passenger/profile/verification'
 */
verificationa8a41ea8312f1190d8d560bd7fd5a000.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: verificationa8a41ea8312f1190d8d560bd7fd5a000.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\PassengerProfileController::verification
 * @see app/Http/Controllers/Api/PassengerProfileController.php:56
 * @route '/api/mobile/verification'
 */
const verification443077a7f8d5a340b0ed15a71aa64f95 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verification443077a7f8d5a340b0ed15a71aa64f95.url(options),
    method: 'get',
})

verification443077a7f8d5a340b0ed15a71aa64f95.definition = {
    methods: ["get","head"],
    url: '/api/mobile/verification',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PassengerProfileController::verification
 * @see app/Http/Controllers/Api/PassengerProfileController.php:56
 * @route '/api/mobile/verification'
 */
verification443077a7f8d5a340b0ed15a71aa64f95.url = (options?: RouteQueryOptions) => {
    return verification443077a7f8d5a340b0ed15a71aa64f95.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PassengerProfileController::verification
 * @see app/Http/Controllers/Api/PassengerProfileController.php:56
 * @route '/api/mobile/verification'
 */
verification443077a7f8d5a340b0ed15a71aa64f95.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verification443077a7f8d5a340b0ed15a71aa64f95.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\PassengerProfileController::verification
 * @see app/Http/Controllers/Api/PassengerProfileController.php:56
 * @route '/api/mobile/verification'
 */
verification443077a7f8d5a340b0ed15a71aa64f95.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: verification443077a7f8d5a340b0ed15a71aa64f95.url(options),
    method: 'head',
})

export const verification = {
    '/api/passenger/profile/verification': verificationa8a41ea8312f1190d8d560bd7fd5a000,
    '/api/mobile/verification': verification443077a7f8d5a340b0ed15a71aa64f95,
}

const PassengerProfileController = { show, update, complete, verification }

export default PassengerProfileController