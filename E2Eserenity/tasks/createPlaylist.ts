import superagent from 'superagent';
import { v4 as uuidv4 } from 'uuid';

// Backend uses global prefix 'api'
const API_BASE = process.env.STICKIFY_API_URL || 'http://localhost:3000/api';

export async function createPlaylist(name: string, createdBy?: string) {
    const payload = {
        id: uuidv4(),
        name,
        trackIds: [],
        type: 'user',
        createdBy: createdBy || 'test-runner',
        createdAt: new Date().toISOString(),
    };

    return superagent.post(`${API_BASE}/playlists`).send(payload).ok(res => res.status < 500);
}

export async function findPlaylistByName(name: string) {
    const encoded = encodeURIComponent(name);
    return superagent.get(`${API_BASE}/playlists/by-name/${encoded}`).ok(res => res.status < 500);
}