
import { Task } from '@phylum/pipeline';
import webpack = require('webpack');

export function webpackTask(getConfig: Task<webpack.Configuration>): Task<webpack.Stats> {
	return new Task(task => {
		task.activity(task.use(getConfig).then(config => {
			const compiler = webpack(config);
			const callback = (error: any, stats: webpack.Stats) => {
				if (error) {
					task.throw(error);
				} else {
					task.return(stats);
				}
			}
			if (config.watch) {
				const watcher = compiler.watch(config.watchOptions, callback);
				task.using(() => new Promise(resolve => watcher.close(resolve)));
			} else {
				task.activity(new Promise(resolve => {
					compiler.run((error, stats) => {
						callback(error, stats);
						resolve();
					});
				}));
			}
		}));
	});
}
