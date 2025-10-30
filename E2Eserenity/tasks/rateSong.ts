import superagent from 'superagent';

// Backend uses global prefix 'api'
const API_BASE = process.env.STICKIFY_API_URL || 'http://localhost:3000/api';

export async function rateSong(userId: string, trackId: number, rating: number) {
    const payload = { userId, trackId, rating };
    return superagent.post(`${API_BASE}/ratings`).send(payload).ok(res => res.status < 500);
}

export async function getRatingsByUser(userId: string) {
    return superagent.get(`${API_BASE}/ratings/user/${encodeURIComponent(userId)}`).ok(res => res.status < 500);
}