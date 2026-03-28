import { Module, Global } from '@nestjs/common';
import { MarkdownService } from './services/markdown.service';
import { FileWatcherService } from './services/file-watcher.service';

@Global()
@Module({
    providers: [MarkdownService, FileWatcherService],
    exports: [MarkdownService, FileWatcherService],
})
export class CommonModule { }
