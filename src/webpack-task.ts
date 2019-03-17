
import { Configuration, Stats } from 'webpack';
import { Task } from '@phylum/pipeline';
import webpack = require('webpack');

export class WebpackTask extends Task<Stats> {
	protected async getWebpackConfig(): Promise<Configuration> {
		return {};
	}

	protected run() {
		const disposableWatcher = this.disposable();
		this.getWebpackConfig().then(config => {
			const compiler = webpack(config);
			const callback = (error: Error, stats: Stats) => {
				if (error) {
					this.error(error);
				} else {
					this.push(stats);
				}
			};
			if (config.watch) {
				const watcher = compiler.watch(config.watchOptions || {}, callback);
				disposableWatcher.resolve(() => new Promise(resolve => watcher.close(resolve)));
			} else {
				compiler.run(callback);
			}
		}).catch(error => {
			this.error(error);
		}).finally(() => {
			disposableWatcher.resolve();
		});
	}
}
