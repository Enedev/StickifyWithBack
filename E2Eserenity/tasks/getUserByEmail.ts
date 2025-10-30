import superagent from 'superagent';

const API_BASE = process.env.STICKIFY_API_URL || 'http://localhost:3000/api';

export async function getUserByEmail(email: string) {
    const url = `${API_BASE}/users/by-email/${encodeURIComponent(email)}`;
    try {
        const res = await superagent.get(url).ok(r => r.status < 500);
        console.log('[getUserByEmail] GET', url, '=>', res.status, res.body);
        return res;
    } catch (err: any) {
        console.error('[getUserByEmail] ERROR', url, err && err.message);
        return { status: err?.status || 500, body: err?.response?.body } as any;
    }
}
