"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var FileWatcherService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileWatcherService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const chokidar = require("chokidar");
const events_1 = require("events");
const path_1 = require("path");
let FileWatcherService = FileWatcherService_1 = class FileWatcherService extends events_1.EventEmitter {
    constructor(configService) {
        super();
        this.configService = configService;
        this.logger = new common_1.Logger(FileWatcherService_1.name);
        this.watcher = null;
        this.docsPath =
            configService.get('DOCS_PATH') || (0, path_1.join)(process.cwd(), '../../../docs');
    }
    onModuleInit() {
        this.startWatching();
    }
    onModuleDestroy() {
        this.stopWatching();
    }
    startWatching() {
        const watchPaths = [
            (0, path_1.join)(this.docsPath, 'epics', '**', '*.md'),
            (0, path_1.join)(this.docsPath, 'bugs', '**', '*.md'),
            (0, path_1.join)(this.docsPath, 'sprints', '**', '*.md'),
            (0, path_1.join)(this.docsPath, 'bursts', '**', '*.md'),
            (0, path_1.join)(this.docsPath, 'progress', '**', '*.md'),
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
    stopWatching() {
        if (this.watcher) {
            this.watcher.close();
            this.watcher = null;
            this.logger.log('File watcher stopped');
        }
    }
    emitChange(type, path) {
        const event = {
            type,
            path,
            timestamp: new Date().toISOString(),
        };
        this.logger.debug(`File ${type}: ${path}`);
        this.emit('fileChange', event);
    }
};
exports.FileWatcherService = FileWatcherService;
exports.FileWatcherService = FileWatcherService = FileWatcherService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FileWatcherService);
//# sourceMappingURL=file-watcher.service.js.map