
import { resolve } from 'path';
import { Compiler, Stats } from 'webpack';
import { ChildProcess, fork } from 'child_process';
import { BundleProcess } from './task';
import { tryHotUpdate } from './hmr';

export class BundleProcessNode implements BundleProcess {
    public constructor(firstStats: Stats) {
        this._compiler = firstStats.compilation.compiler;

        const mainChunkName = 'main';
        const mainChunk = firstStats.compilation.chunks.find(c => c.name === mainChunkName);
        if (!mainChunk) {
            throw new Error(`Main chunk ("${mainChunkName}") not found.`);
        }
        const file = mainChunk.files[0];
        if (!file) {
            throw new Error(`Main chunk ("${mainChunkName}") does not have any files.`);
        }
        this._filename = resolve(this._compiler.options.output.path, file);
    }

    private readonly _compiler: Compiler;
    private readonly _filename: string;
    private _process: ChildProcess;
    private _exited: Promise<void>;

    public get compiler() {
        return this._compiler;
    }

    public async dispose() {
        if (this._process && !this._process.killed) {
            this._process.kill();
        }
        await this._exited;
    }

    public async update(onError: (error: any) => void) {
        if (this._process && !await tryHotUpdate(this._process)) {
            await this.dispose();
        }
        if (!this._process) {
            const proc = fork(this._filename, [], {
                cwd: this._compiler.options.context,
                stdio: [0, 1, 2, 'ipc']
            });
            this._exited = new Promise(resolve => {
                proc.on('exit', () => {
                    if (this._process === proc) {
                        this._process = null;
                    }
                    resolve();
                });
                proc.on('error', error => {
                    if (this._process === proc) {
                        this._process = null;
                    }
                    resolve();
                    onError(error);
                });
            });
            this._process = proc;
        }
    }
}
