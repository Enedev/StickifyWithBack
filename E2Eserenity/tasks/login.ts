import superagent from 'superagent';

// Backend sets a global prefix 'api' (see stickify-back/src/main.ts)
// Use /api in the default base so tests work out of the box.
const API_BASE = process.env.STICKIFY_API_URL || 'http://localhost:3000/api';

export async function apiSignUp(username: string, email: string, password: string) {
    const payload = { username, email, password };
    const url = `${API_BASE}/auth/sign-up`;
    try {
        const res = await superagent.post(url).send(payload).ok(res => res.status < 500);
        console.log('[apiSignUp] POST', url, '=>', res.status, res.body);
        return res;
    }
    catch (err: any) {
        console.error('[apiSignUp] ERROR', url, err && err.message);
        return { status: err?.status || 500, body: err?.response?.body } as any;
    }
}

export async function apiLogin(email: string, password: string) {
    const payload = { email, password };
    const url = `${API_BASE}/auth/login`;
    try {
        const res = await superagent.post(url).send(payload).ok(res => res.status < 500);
        console.log('[apiLogin] POST', url, '=>', res.status, res.body);
        return res;
    }
    catch (err: any) {
        console.error('[apiLogin] ERROR', url, err && err.message);
        return { status: err?.status || 500, body: err?.response?.body } as any;
    }
}

// Lightweight UI helper kept for backward compatibility if needed by steps that drive a browser.
// This is a stub: if you want real Selenium-driven flows, wire Protractor/WebDriver here.
export const loginTask = async (username: string, password: string) => {
    // noop - prefer API login in these tests
    return apiLogin(username, password);
};