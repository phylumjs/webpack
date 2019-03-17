
import { Task } from '@phylum/pipeline';
import { WebpackTask } from './webpack-task';
import { ChildProcess, fork } from 'child_process';
import { Stats } from 'webpack';
import { resolve } from 'path';

export class WebpackRunTask extends Task<void> {
	getWebpackTask(): WebpackTask {
		return this.container.get(WebpackTask);
	}

	run() {
		const webpack = this.getWebpackTask();

		let proc: ChildProcess = null;

		this.disposable(webpack.pipe(state => {
			const procDisposable = this.disposable();
			state.then(stats => {
				if (stats.hasErrors()) {
					return;
				}

				if (!proc) {
					const {target, context} = stats.compilation.compiler.options;
					if (target === 'node' || target === 'async-node') {
						const filename = getChunkFilename(stats, 'main');
						proc = fork(filename, [], {
							cwd: context,
							stdio: [0, 1, 2, 'ipc']
						});
						proc.on('exit', () => {
							proc = null;
							this.push();
						});
						procDisposable.resolve(() => proc.kill());
					} else {
						throw new Error('Compilation target must be "node", "async-node".');
					}
				}
			}).catch(error => {
				this.error(error);
			}).finally(() => {
				procDisposable.resolve();
			});
		}));
	}
}

function getChunkFilename(stats: Stats, name: string): string {
	const {compilation} = stats;
	const mainChunk = compilation.chunks.find(chunk => chunk.name === name);
	if (!mainChunk) {
		throw new TypeError('Main chunk not found.');
	}
	return resolve(compilation.compiler.options.output.path, mainChunk.files[0]);
}
