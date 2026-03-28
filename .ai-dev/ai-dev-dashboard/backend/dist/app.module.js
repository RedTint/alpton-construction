"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const common_module_1 = require("./common/common.module");
const board_module_1 = require("./board/board.module");
const health_module_1 = require("./health/health.module");
const epics_module_1 = require("./epics/epics.module");
const stories_module_1 = require("./stories/stories.module");
const bugs_module_1 = require("./bugs/bugs.module");
const sprints_module_1 = require("./sprints/sprints.module");
const bursts_module_1 = require("./bursts/bursts.module");
const progress_module_1 = require("./progress/progress.module");
const documents_module_1 = require("./documents/documents.module");
const cli_module_1 = require("./cli/cli.module");
const clients_module_1 = require("./clients/clients.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            common_module_1.CommonModule,
            board_module_1.BoardModule,
            health_module_1.HealthModule,
            epics_module_1.EpicsModule,
            stories_module_1.StoriesModule,
            bugs_module_1.BugsModule,
            sprints_module_1.SprintsModule,
            bursts_module_1.BurstsModule,
            progress_module_1.ProgressModule,
            documents_module_1.DocumentsModule,
            clients_module_1.ClientsModule,
            cli_module_1.CLIModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map