# PhlumJS + Webpack

## Installation
```bash
npm i @phylum/webpack webpack
```

<br>

# Usage
```ts
import { Task } from '@phylum/pipeline';
import { WebpackTask } from '@phylum/webpack';

const config = Task.value({
	// ...webpack config...
});

const bundle = new WebpackTask(config);
```

## Output
The task will output stats from the latest compilation<br>
and will only reject in case of critical errors.
```ts
new Task(async t => {
	const stats = await t.use(bundle);
	const data = stats.toJson();
	for (const msg of data.warnings) {
		console.warn(msg);
	}
	for (const msg of data.errors) {
		console.error(msg);
	}
});
```
