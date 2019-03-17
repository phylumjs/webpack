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

## Stats
The task outputs the latest webpack compilation stats.
```ts
// somewhere in another task:
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
