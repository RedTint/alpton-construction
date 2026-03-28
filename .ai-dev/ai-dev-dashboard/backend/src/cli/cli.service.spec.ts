import { Test, TestingModule } from '@nestjs/testing';
import { CLIService } from './cli.service';
import * as child_process from 'child_process';
import { EventEmitter } from 'events';

jest.mock('child_process');

const mockSpawn = child_process.spawn as jest.MockedFunction<typeof child_process.spawn>;

function createMockProcess(exitCode = 0, stdout = '', stderr = ''): any {
    const proc = new EventEmitter() as any;
    proc.stdout = new EventEmitter();
    proc.stderr = new EventEmitter();
    proc.kill = jest.fn();

    // Use setImmediate for faster resolution in tests
    setImmediate(() => {
        if (stdout) proc.stdout.emit('data', Buffer.from(stdout));
        if (stderr) proc.stderr.emit('data', Buffer.from(stderr));
        proc.emit('close', exitCode);
    });

    return proc;
}

describe('CLIService', () => {
    let service: CLIService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [CLIService],
        }).compile();
        service = module.get<CLIService>(CLIService);
    });

    afterEach(() => jest.restoreAllMocks());

    describe('executeCommand', () => {
        it('should create command result with correct fields', async () => {
            mockSpawn.mockReturnValue(createMockProcess(0, 'hello\n'));

            const result = await service.executeCommand({ command: 'echo', args: ['hello'] });
            expect(result.command).toBe('echo');
            expect(result.args).toEqual(['hello']);
            expect(result.id).toBeDefined();
            expect(result.startedAt).toBeDefined();
            expect(result.completedAt).toBeDefined();
            expect(result.status).toBe('completed');
        });

        it('should capture stdout from successful command', async () => {
            mockSpawn.mockReturnValue(createMockProcess(0, 'test123\n'));

            const result = await service.executeCommand({ command: 'echo', args: ['test123'] });
            expect(result.status).toBe('completed');
            expect(result.output).toContain('test123');
        });

        it('should handle failed commands gracefully', async () => {
            const proc = new EventEmitter() as any;
            proc.stdout = new EventEmitter();
            proc.stderr = new EventEmitter();
            proc.kill = jest.fn();
            setImmediate(() => proc.emit('error', new Error('Command not found')));
            mockSpawn.mockReturnValue(proc);

            const result = await service.executeCommand({ command: 'nonexistent' });
            expect(result.status).toBe('failed');
            expect(result.error).toContain('Command not found');
        });

        it('should capture stderr from commands', async () => {
            mockSpawn.mockReturnValue(createMockProcess(1, '', 'Permission denied'));

            const result = await service.executeCommand({ command: 'restricted-cmd' });
            expect(result.status).toBe('failed');
            expect(result.error).toContain('Permission denied');
        });
    });

    describe('getCommandHistory', () => {
        it('should return empty history initially', () => {
            expect(service.getCommandHistory()).toEqual([]);
        });

        it('should add command to history after execution', async () => {
            mockSpawn.mockReturnValue(createMockProcess(0, 'output\n'));
            await service.executeCommand({ command: 'echo', args: ['tracked'] });

            const history = service.getCommandHistory();
            expect(history.length).toBe(1);
            expect(history[0].command).toBe('echo');
            expect(history[0].args).toEqual(['tracked']);
            expect(history[0].status).toBe('completed');
        });
    });
});
