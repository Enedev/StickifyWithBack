import superagent from 'superagent';

// Backend uses global prefix 'api'
const API_BASE = process.env.STICKIFY_API_URL || 'http://localhost:3000/api';

export async function searchSongs(query: string) {
    try {
        // First try with the search endpoint
        const searchRes = await superagent
            .get(`${API_BASE}/songs/search`)
            .query({ query })
            .timeout({ response: 10000, deadline: 30000 })
            .ok(r => r.status < 500);
        return searchRes.body || [];
    } catch (err) {
        // If search endpoint fails, fallback to filtering all songs
        const res = await superagent
            .get(`${API_BASE}/songs`)
            .timeout({ response: 10000, deadline: 30000 })
            .ok(r => r.status < 500);
        const songs = res.body || [];
        return songs.filter((s: any) => 
            (s.trackName || '').toLowerCase().includes(query.toLowerCase()) ||
            (s.artist || '').toLowerCase().includes(query.toLowerCase())
        );
    }
}
