# PhlumJS + Webpack

## Installation
```bash
npm i @phylum/webpack webpack
```

<br>



# Usage
```ts
import { WebpackTask } from '@phylum/webpack';

class BundleTask extends WebpackTask {
	// This function is called to get the webpack configuration:
	async getWebpackConfig() {
		return {
			// ...webpack config...
		};
	}
}
```

## Output
The task outputs compilation stats:
```ts
const stats = await this.use(BundleTask);
```

## Watch mode
The task will run webpack in watch mode automatically, when webpack's `watch` options is truthy.
```ts
async getWebpackConfig() {
	return {
		// ...webpack config...
		watch: true
	};
}
```

## Running bundle processes
If you are bundling code that will run in node or an electron main process,<br>
you can automatically start a process during development using the `BundleProcessTask`:
```ts
import { BundleProcessTask, WebpackTask } from '@phylum/webpack';
import { HotModuleReplacementPlugin } from 'webpack';

class BundleTask extends WebpackTask {
	async getWebpackConfig() {
		return {
			// The following targets are supported:
			target: 'node' | 'async-node',

			// Add the process hmr server to your entry or import
			// it somewhere in your code to enable hmr support:
			entry: ['@phylum/webpack/hmr', 'src/main.js'],

			plugins: [
				// To enable hmr support:
				new HotModuleReplacementPlugin()
			],

			// ...webpack config...
		};
	}
}

class StartBundle extends BundleProcessTask {
	// This function is called to get the bundle task:
	getTarget() {
		return this.container.get(BundleTask);
	}
}

class MainTask extends Task<void> {
	async run() {
		await Promise.all([
			// Run the bundle task:
			this.use(BundleTask),
			// And start the bundle process:
			this.use(StartBundle)
		]);
	}
}
```
