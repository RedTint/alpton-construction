"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoardModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const board_controller_1 = require("./board.controller");
const board_service_1 = require("./board.service");
const epics_module_1 = require("../epics/epics.module");
const stories_module_1 = require("../stories/stories.module");
const common_module_1 = require("../common/common.module");
let BoardModule = class BoardModule {
};
exports.BoardModule = BoardModule;
exports.BoardModule = BoardModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule, epics_module_1.EpicsModule, stories_module_1.StoriesModule, common_module_1.CommonModule],
        controllers: [board_controller_1.BoardController],
        providers: [board_service_1.BoardService],
        exports: [board_service_1.BoardService],
    })
], BoardModule);
//# sourceMappingURL=board.module.js.map