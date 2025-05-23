import axios from 'axios';
import { ENVS } from './envs';

import { store } from '../Redux/store';
import { resetLoggedInUser, setLoggedInUser } from '../Redux/auth/userSlice';
import { navigateTo } from './navigateService';

const dispatch = store.dispatch;
const DEBUG = false;

export const api = axios.create({
    baseURL: ENVS.BACKEND_API_URL,
    withCredentials: true,
});

export let accessToken = null;

// Allow your app to set the token
export const setAxiosAccessToken = (token) => {
    accessToken = token;
    if (token) {
        if (DEBUG) console.log('[Axios] Setting new access token:', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        if (DEBUG) console.log('[Axios] Clearing access token.');
        delete api.defaults.headers.common['Authorization'];
    }
};

// Axios retry queue helpers
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    if (DEBUG) console.log('[Axios] Processing failed request queue...');
    failedQueue.forEach(prom => {
        if (error) {
            if (DEBUG) console.log('[Axios] Rejecting request from queue.');
            prom.reject(error);
        } else {
            if (DEBUG) console.log('[Axios] Resolving request from queue with new token.');
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Add token to requests
api.interceptors.request.use(
    (config) => {
        if (accessToken) {
            if (DEBUG) console.log(`[Axios][Request] Adding Authorization header.`);
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        } else {
            if (DEBUG) console.log(`[Axios][Request] No access token set.`);
        }
        return config;
    },
    (error) => {
        if (DEBUG) console.error('[Axios][Request] Request error:', error);
        return Promise.reject(error);
    }
);

// Refresh logic
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (DEBUG) console.warn('[Axios][Response] 401 received. Trying to refresh token...');

            if (isRefreshing) {
                if (DEBUG) console.log('[Axios][Response] Already refreshing token, queueing request.');
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        if (DEBUG) console.log('[Axios][Retry] Retrying original request with refreshed token.');
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch(err => {
                        if (DEBUG) console.error('[Axios][Retry] Failed to retry request:', err);
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                setAxiosAccessToken(null); // Clear the token before refreshing

                if (DEBUG) console.log('[Axios][Refresh] Sending request to refresh token...');
                const res = await api.post('auth/refresh/');
                const { data } = res.data;
                const { access_token: newToken, user } = data;

                if (DEBUG) console.log('[Axios][Refresh] Token refresh successful.');
                if (DEBUG) console.log('[Axios][Refresh] New access token:', newToken);
                if (DEBUG) console.log('[Axios][Refresh] User info:', user);

                setAxiosAccessToken(newToken);
                processQueue(null, newToken);

                dispatch(setLoggedInUser({ user, access_token: newToken }));

                if (DEBUG) console.log('[Axios][Refresh] Retrying original request...');
                return api(originalRequest);
            } catch (err) {
                if (DEBUG) console.error('[Axios][Refresh] Token refresh failed:', err);
                processQueue(err, null);

                dispatch(resetLoggedInUser());
                setAxiosAccessToken(null);

                navigateTo('/login')

                return Promise.reject(err);
            } finally {
                if (DEBUG) console.log('[Axios][Refresh] Refresh flow finished.');
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);
