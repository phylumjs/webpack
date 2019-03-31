// @ts-check
'use strict';

import test from 'ava';
import { dir } from 'tmp';
import { remove, access, writeFile } from 'fs-extra';
import { WebpackTask } from '..';
import { Task, dispose } from '@phylum/pipeline';
import webpack from 'webpack';

test('simple usage', async t => {
	await Promise.all([false, true].map(passCompiler => tmp(async dirname => {
		const config = {
			context: `${dirname}/..`,
			entry: `${dirname}/entry.js`,
			output: {
				path: `${dirname}/dist`,
				filename: 'index.js'
			}
		};
		const bundle = new WebpackTask(Task.value(passCompiler ? webpack(config) : config));
		await writeFile(`${dirname}/entry.js`, 'console.log("foo");');
		const start = bundle.start();

		await new Promise((resolve, reject) => {
			const r = bundle.pipe(state => state.then(resolve, reject).then(() => dispose(r)));
		});
		await access(`${dirname}/dist/index.js`);

		dispose(start);
		await bundle.inactive();
		t.pass();
	})));
});

test('error handling', async t => {
	const fakeCompiler = Object.assign(Object.create(webpack({})), {
		run(callback) {
			Promise.resolve().then(() => callback(new Error('foo')));
		}
	});
	const bundle = new WebpackTask(Task.value(fakeCompiler));
	const start = bundle.start();
	const error = await new Promise((resolve, reject) => {
		const r = bundle.pipe(state => state.then(reject, resolve).then(() => dispose(r)));
	});
	dispose(start);
	await bundle.inactive();
	t.is(error.message, 'foo');
});

test('watch', t => tmp(async dirname => {
	const bundle = new WebpackTask(Task.value({
		context: `${dirname}/..`,
		entry: `${dirname}/entry.js`,
		output: {
			path: `${dirname}/dist`,
			filename: 'index.js'
		},
		watch: true
	}));
	await writeFile(`${dirname}/entry.js`, 'console.log("foo");');
	const start = bundle.start();

	await new Promise((resolve, reject) => {
		let first = true;
		const pipe = bundle.pipe(state => {
			state.then(async () => {
				if (first) {
					first = false;
					await access(`${dirname}/dist/index.js`);
					await writeFile(`${dirname}/entry.js`, 'console.log("bar");');
				} else {
					await access(`${dirname}/dist/index.js`);
					resolve();
				}
			}).catch(reject);
		});
	});

	dispose(start);
	await bundle.inactive();
	t.pass();
}));

/**
 * @param {(dirname: string) => Promise<void>} callback
 * @returns {Promise<void>}
 */
async function tmp(callback) {
	const dirname = await new Promise((resolve, reject) => {
		dir((error, dirname) => {
			if (error) {
				reject(error);
			} else {
				resolve(dirname);
			}
		});
	});
	try {
		await callback(dirname);
	} finally {
		await remove(dirname);
	}
}
