# PhlumJS + Webpack

## Installation
```bash
npm i @phylum/webpack webpack
```

<br>

# Usage
```ts
import { webpackTask } from '@phylum/webpack';

webpackTask(config);
```
+ config `Task<webpack.Configuration>` - A task that returns the configuration to use for the compiler.
+ returns `WebpackTask` - A task that runs a webpack compiler either a single time or in watch mode if configured.
