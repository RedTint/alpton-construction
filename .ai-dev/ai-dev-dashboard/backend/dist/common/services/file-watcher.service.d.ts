import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter } from 'events';
export interface FileChangeEvent {
    type: 'add' | 'change' | 'unlink';
    path: string;
    timestamp: string;
}
export declare class FileWatcherService extends EventEmitter implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private readonly logger;
    private watcher;
    private readonly docsPath;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    startWatching(): void;
    stopWatching(): void;
    private emitChange;
}
