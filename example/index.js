'use strict';

const { resolve } = require('path');
const { Task } = require('@phylum/pipeline');
const { ConfigTask } = require('@phylum/cli');
const { WebpackRunTask, WebpackTask } = require('..');

class Bundle extends WebpackTask {
	async getWebpackConfig() {
		const {command} = await this.use(ConfigTask);
		return {
			context: resolve(__dirname, '..'),
			entry: './example/src',
			target: 'node',
			output: {
				path: resolve(__dirname, 'dist')
			},
			mode: command.string('mode', 'development'),
			watch: command.has('watch')
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

class RunBundle extends WebpackRunTask {
	getWebpackTask() {
		return this.container.get(Bundle);
	}
}

exports.default = class Main extends Task {
	async run() {
		await Promise.all([
			this.use(BundleAndLog),
			this.use(RunBundle)
		]);
	}
};
