'use strict';

import { startHmrServer } from './dist/bundle-process/hmr';

startHmrServer().catch(error => {
	console.error('Failed to start hmr server:', error);
});
