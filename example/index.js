'use strict';

const { resolve } = require('path');
const { HotModuleReplacementPlugin } = require('webpack');
const { Task } = require('@phylum/pipeline');
const { ConfigTask } = require('@phylum/cli');
const { WebpackTask, BundleProcessTask } = require('..');

class Bundle extends WebpackTask {
	async getWebpackConfig() {
		const {command} = await this.use(ConfigTask);
		const watch = command.has('watch');
		return {
			context: resolve(__dirname, '..'),
			entry: [require.resolve('../process-hmr'), './example/src'],
			target: 'node',
			output: {
				path: resolve(__dirname, 'dist')
			},
			mode: command.string('mode', 'development'),
			watch,
			plugins: [
				new HotModuleReplacementPlugin()
			]
		};
	}
}

class BundleAndLog extends Task {
	async run() {
		const stats = await this.use(Bundle);
		const data = stats.toJson();
		for (const msg of data.errors) {
			console.error(msg);
		}
		for (const msg of data.warnings) {
			console.warn(msg);
		}
		console.log('Bundle finished.');
	}
}

class StartBundle extends BundleProcessTask {
	getTarget() {
		return this.container.get(Bundle)
	}
}

exports.default = class Main extends Task {
	async run() {
		await Promise.all([
			this.use(BundleAndLog),
			this.use(StartBundle)
		]);
	}
};
