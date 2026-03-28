import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as chokidar from 'chokidar';
import { EventEmitter } from 'events';
import { join } from 'path';

export interface FileChangeEvent {
    type: 'add' | 'change' | 'unlink';
    path: string;
    timestamp: string;
}

@Injectable()
export class FileWatcherService
    extends EventEmitter
    implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(FileWatcherService.name);
    private watcher: chokidar.FSWatcher | null = null;
    private readonly docsPath: string;

    constructor(private readonly configService: ConfigService) {
        super();
        this.docsPath =
            configService.get<string>('DOCS_PATH') || join(process.cwd(), '../../../docs');
    }

    onModuleInit() {
        this.startWatching();
    }

    onModuleDestroy() {
        this.stopWatching();
    }

    startWatching(): void {
        const watchPaths = [
            join(this.docsPath, 'epics', '**', '*.md'),
            join(this.docsPath, 'bugs', '**', '*.md'),
            join(this.docsPath, 'sprints', '**', '*.md'),
            join(this.docsPath, 'bursts', '**', '*.md'),
            join(this.docsPath, 'progress', '**', '*.md'),
        ];

        this.watcher = chokidar.watch(watchPaths, {
            persistent: true,
            ignoreInitial: true,
            awaitWriteFinish: { stabilityThreshold: 300 },
        });

        this.watcher.on('add', (path) => this.emitChange('add', path));
        this.watcher.on('change', (path) => this.emitChange('change', path));
        this.watcher.on('unlink', (path) => this.emitChange('unlink', path));

        this.logger.log(`File watcher started on ${this.docsPath}`);
    }

    stopWatching(): void {
        if (this.watcher) {
            this.watcher.close();
            this.watcher = null;
            this.logger.log('File watcher stopped');
        }
    }

    private emitChange(type: FileChangeEvent['type'], path: string): void {
        const event: FileChangeEvent = {
            type,
            path,
            timestamp: new Date().toISOString(),
        };
        this.logger.debug(`File ${type}: ${path}`);
        this.emit('fileChange', event);
    }
}
