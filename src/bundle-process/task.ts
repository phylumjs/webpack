
import { EventAggregator, Task, DisposableObject } from '@phylum/pipeline';
import { Stats, Compiler } from 'webpack';
import { WebpackTask } from '../webpack-task';
import { BundleProcessNode } from './node';

export abstract class BundleProcessTask extends Task<void> {
    abstract getTarget(): WebpackTask;

    * subscribe(ea: EventAggregator) {
        yield * super.subscribe(ea);
    }

    run() {
        let adapter: BundleProcess = null;
        this.getTarget().pipe(state => {
            const disposeAdapter = this.disposable();
            state.then(async stats => {
                if (adapter && adapter.compiler !== stats.compilation.compiler) {
                    await adapter.dispose();
                    adapter = null;
                }
                if (adapter) {
                    await adapter.update(error => this.error(error));
                } else {
                    adapter = getAdapter(stats);
                    await adapter.update(error => this.error(error));
                    disposeAdapter.resolve(adapter);
                }
            }).catch(error => {
                this.error(error);
            }).finally(() => {
                disposeAdapter.resolve();
            });
        });
    }
}

function getAdapter(firstStats: Stats): BundleProcess {
    const {target} = firstStats.compilation.compiler.options;
    if (target === 'node' || target === 'async-node') {
        return new BundleProcessNode(firstStats);
    }
    throw new Error(`Bundles that target "${target}" can not be started as a process.`);
}

export interface BundleProcess extends DisposableObject {
    readonly compiler: Compiler;

    update(onError: (error: any) => void): Promise<void>;
}
