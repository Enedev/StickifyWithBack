import superagent from 'superagent';

// Backend uses global prefix 'api'
const API_BASE = process.env.STICKIFY_API_URL || 'http://localhost:3000/api';

/**
 * Toggle follow for a user (followerId follows targetEmail)
 */
export async function followUser(followerId: string, targetEmail: string, follow = true) {
    const url = `${API_BASE}/users/${encodeURIComponent(followerId)}/follow`;
    try {
        const res = await superagent.put(url).send({ targetEmail, follow }).ok(res => res.status < 500);
        console.log('[followUser] PUT', url, '=>', res.status, res.body);
        return res;
    }
    catch (err: any) {
        console.error('[followUser] ERROR', url, err && err.message);
        return { status: err?.status || 500, body: err?.response?.body } as any;
    }
}
