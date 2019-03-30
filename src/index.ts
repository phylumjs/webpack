
import { Task } from '@phylum/pipeline';
import webpack = require('webpack');

export class WebpackTask extends Task<webpack.Stats> {
	public constructor(getConfigOrCompiler: Task<webpack.Configuration | webpack.Compiler>) {
		const getCompiler = getConfigOrCompiler.transform<webpack.Compiler>(configOrCompiler => {
			if (configOrCompiler instanceof webpack.Compiler) {
				return configOrCompiler;
			}
			return webpack(configOrCompiler);
		});
		super(task => {
			task.activity(task.use(getCompiler).then(compiler => {
				const callback = (error: any, stats: webpack.Stats) => {
					if (error) {
						task.throw(error);
					} else {
						task.return(stats);
					}
				}
				if (compiler.options.watch) {
					const watcher = compiler.watch(compiler.options.watchOptions, callback);
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
		this.getCompiler = getCompiler;
	}

	public readonly getCompiler: Task<webpack.Compiler>;
}
