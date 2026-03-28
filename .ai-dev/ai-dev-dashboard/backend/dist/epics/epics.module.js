"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EpicsModule = void 0;
const common_1 = require("@nestjs/common");
const epics_controller_1 = require("./epics.controller");
const epics_service_1 = require("./epics.service");
let EpicsModule = class EpicsModule {
};
exports.EpicsModule = EpicsModule;
exports.EpicsModule = EpicsModule = __decorate([
    (0, common_1.Module)({
        controllers: [epics_controller_1.EpicsController],
        providers: [epics_service_1.EpicsService],
        exports: [epics_service_1.EpicsService],
    })
], EpicsModule);
//# sourceMappingURL=epics.module.js.map