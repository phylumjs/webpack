# PhlumJS + Webpack

## Installation
```bash
npm i @phylum/webpack webpack
```

<br>

# Usage
```ts
import { WebpackTask } from '@phylum/webpack';

const task = new WebpackTask(getConfigOrCompiler);
```
+ getConfigOrCompiler `Task<webpack.Configuration | webpack.Compiler>` - A task that returns the configuration to use for the compiler.
+ returns `WebpackTask` - A task that runs a webpack compiler either a single time or in watch mode if configured.
