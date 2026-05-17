import { router } from 'expo-router';

import { API_URL, currentUser, logoutUser } from './UserStore';

/**
 * Central API client for the UPasakay mobile app.
 *
 * Wraps fetch with the backend base URL, JSON headers, and the Sanctum
 * bearer token. Any 401 response means the stored token is expired or was
 * revoked: we clear the persisted session and bounce the user back to the
 * Login screen so they're never trapped on a dead screen making failing calls.
 *
 * Prefer apiGet/apiPost/apiPatch/apiDelete in new code instead of hand-rolling
 * fetch + Authorization headers per screen.
 */

let isHandling401 = false;

const handleUnauthorized = async () => {
    // Guard so a burst of parallel 401s only logs the user out once.
    if (isHandling401) return;
    isHandling401 = true;
    try {
        await logoutUser();
        router.replace('/');
    } finally {
        // Reset shortly after so a genuinely new session can 401 again later.
        setTimeout(() => { isHandling401 = false; }, 1000);
    }
};

const buildUrl = (path) => {
    if (/^https?:\/\//i.test(path)) return path;
    const base = API_URL.replace(/\/$/, '');
    return `${base}/${String(path).replace(/^\//, '')}`;
};

/**
 * Low-level request. Returns { ok, status, data } where data is the parsed
 * JSON body (or null if the body wasn't JSON). Throws only on network failure.
 */
export const apiFetch = async (path, { method = 'GET', body, headers = {}, ...rest } = {}) => {
    const isForm = typeof FormData !== 'undefined' && body instanceof FormData;

    const finalHeaders = {
        Accept: 'application/json',
        ...(isForm ? {} : { 'Content-Type': 'application/json' }),
        ...(currentUser?.token ? { Authorization: `Bearer ${currentUser.token}` } : {}),
        ...headers,
    };

    let response;
    try {
        response = await fetch(buildUrl(path), {
            method,
            headers: finalHeaders,
            ...(body !== undefined
                ? { body: isForm || typeof body === 'string' ? body : JSON.stringify(body) }
                : {}),
            ...rest,
        });
    } catch (err) {
        // Offline / DNS / TLS failure: fetch rejects with
        // "TypeError: Network request failed". Return a handled result so
        // callers show their error UI instead of an unhandled rejection.
        console.warn('[api] network error:', err?.message ?? err);
        return {
            ok: false,
            status: 0,
            data: { message: 'Network error. Check your connection.' },
        };
    }

    if (response.status === 401) {
        await handleUnauthorized();
        return { ok: false, status: 401, data: { message: 'Session expired. Please log in again.' } };
    }

    let data = null;
    try {
        data = await response.json();
    } catch {
        data = null;
    }

    return { ok: response.ok, status: response.status, data };
};

export const apiGet = (path, options = {}) => apiFetch(path, { ...options, method: 'GET' });
export const apiPost = (path, body, options = {}) => apiFetch(path, { ...options, method: 'POST', body });
export const apiPatch = (path, body, options = {}) => apiFetch(path, { ...options, method: 'PATCH', body });
export const apiDelete = (path, options = {}) => apiFetch(path, { ...options, method: 'DELETE' });

export default apiFetch;
