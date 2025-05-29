export const ENVS = {
    BACKEND_URL: 'http://localhost:8000',
    BACKEND_API_URL: undefined,
    FRONTEND_STORAGE_METHOD: sessionStorage,
    FRONTEND_STORAGE_KEY: 'ordenavia',
}

ENVS.BACKEND_API_URL = ENVS.BACKEND_URL + "/api/";