import http from 'http';
import https from 'https';

export class InteractWithApi {
  baseUrl: string;
  defaultHeaders: Record<string,string> = {};
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private normalizePath(path: string) {
    // Ensure path starts with a single slash; do not force /api here because baseUrl may already include it
    if (!path.startsWith('/')) path = '/' + path;
    return path;
  }

  setAuth(token: string) {
    if (token) this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  async post(path: string, body: any, headers: Record<string,string> = {}) {
  const fullPath = this.normalizePath(path);
  const url = new URL(this.baseUrl + fullPath);
    const data = JSON.stringify(body || {});

    const options: any = {
      method: 'POST',
      headers: Object.assign({
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data).toString()
      }, this.defaultHeaders || {}, headers),
      timeout: 10000
    };

    const client = url.protocol === 'https:' ? https : http;

    return new Promise<any>((resolve, reject) => {
      const req = client.request(url, options, (res: any) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (chunk: any) => raw += chunk);
        res.on('end', () => {
          try {
            const parsed = raw ? JSON.parse(raw) : {};
            resolve({ statusCode: res.statusCode, body: parsed });
          } catch (err) {
            resolve({ statusCode: res.statusCode, body: raw });
          }
        });
      });

      req.on('error', (err: any) => reject(err));
      req.on('timeout', () => {
        req.destroy(new Error('request-timeout'));
      });
      req.write(data);
      req.end();
    });
  }

  async get(path: string, headers: Record<string,string> = {}) {
  const fullPath = this.normalizePath(path);
  const url = new URL(this.baseUrl + fullPath);
    const options: any = {
      method: 'GET',
      headers: Object.assign({}, this.defaultHeaders || {}, headers),
      timeout: 10000,
    };

    const client = url.protocol === 'https:' ? https : (http as any);

    return new Promise<any>((resolve, reject) => {
      const req = client.request(url, options, (res: any) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (chunk: any) => raw += chunk);
        res.on('end', () => {
          try {
            const parsed = raw ? JSON.parse(raw) : {};
            resolve({ statusCode: res.statusCode, body: parsed });
          } catch (err) {
            resolve({ statusCode: res.statusCode, body: raw });
          }
        });
      });

      req.on('error', (err: any) => reject(err));
      req.on('timeout', () => req.destroy(new Error('request-timeout')));
      req.end();
    });
  }

  async delete(path: string, headers: Record<string,string> = {}) {
  const fullPath = this.normalizePath(path);
  const url = new URL(this.baseUrl + fullPath);
  const options: any = { method: 'DELETE', headers: Object.assign({}, this.defaultHeaders || {}, headers), timeout: 10000 };
    const client = url.protocol === 'https:' ? https : (http as any);

    return new Promise<any>((resolve, reject) => {
      const req = client.request(url, options, (res: any) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (chunk: any) => raw += chunk);
        res.on('end', () => {
          try { resolve({ statusCode: res.statusCode, body: raw ? JSON.parse(raw) : {} }); } catch { resolve({ statusCode: res.statusCode, body: raw }); }
        });
      });
      req.on('error', (err: any) => reject(err));
      req.on('timeout', () => req.destroy(new Error('request-timeout')));
      req.end();
    });
  }

  async put(path: string, body: any, headers: Record<string,string> = {}) {
  const fullPath = this.normalizePath(path);
  const url = new URL(this.baseUrl + fullPath);
    const data = JSON.stringify(body || {});

    const options: any = {
      method: 'PUT',
      headers: Object.assign({
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data).toString()
      }, this.defaultHeaders || {}, headers),
      timeout: 10000
    };

    const client = url.protocol === 'https:' ? https : http;

    return new Promise<any>((resolve, reject) => {
      const req = client.request(url, options, (res: any) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (chunk: any) => raw += chunk);
        res.on('end', () => {
          try {
            const parsed = raw ? JSON.parse(raw) : {};
            resolve({ statusCode: res.statusCode, body: parsed });
          } catch (err) {
            resolve({ statusCode: res.statusCode, body: raw });
          }
        });
      });

      req.on('error', (err: any) => reject(err));
      req.on('timeout', () => req.destroy(new Error('request-timeout')));
      req.write(data);
      req.end();
    });
  }
}
