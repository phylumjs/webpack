
import { join } from 'path';
import { tmpdir } from 'os';
import { ChildProcess } from 'child_process';
import { createServer, request } from 'http';
import { unlink } from 'fs';

function getHmrSocketPath(pid: number) {
    return process.platform === 'win32'
        ? `\\\\?\\pipe\\phylum\\webpack\\bundle-process-${pid}`
        : join(tmpdir(), `phlum-webpack-bundle-process-${pid}`);
}

export async function tryHotUpdate(proc: ChildProcess): Promise<boolean> {
    const hmrSocketPath = getHmrSocketPath(proc.pid);
    return new Promise((resolve, reject) => {
        const req = request({
            socketPath: hmrSocketPath,
            path: '/update'
        }, res => {
            resolve(res.statusCode === 200);
            res.resume();
        });
        req.on('error', error => {
            if (error && (error as any).code === 'ENOENT') {
                resolve(false);
            } else {
                reject(error);
            }
        });
        req.end();
    });
}

export async function startHmrServer() {
	if ((module as any).hot) {
        function applyUpdate() {
            let ok = true;
            return (module as any).hot.check({
                ignoreUnaccepted: true,
                ignoreDeclined: true,
                onUnaccepted() {
                    ok = false;
                },
                onDeclined() {
                    ok = false;
                }
            }).then(() => {
                return ok;
            }).catch(error => {
                console.error('Failed to apply hmr update:', error);
                return false;
            });
        }

		const server = createServer((req, res) => {
            switch (req.url.replace(/\?.*$/, '')) {
                case '/update':
                    applyUpdate().then(ok => {
                        res.statusCode = ok ? 200 : 500;
                        res.end();
                    });
                    break;

                default:
                    res.statusCode = 404;
                    res.end();
                    break;
            }
        });

        const hmrSocketPath = getHmrSocketPath(process.pid);
        await new Promise(resolve => unlink(hmrSocketPath, resolve));
        server.listen(hmrSocketPath);
        server.unref();
	}
}
