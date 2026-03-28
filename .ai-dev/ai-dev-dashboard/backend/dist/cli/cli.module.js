"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLIModule = void 0;
const common_1 = require("@nestjs/common");
const cli_controller_1 = require("./cli.controller");
const cli_service_1 = require("./cli.service");
let CLIModule = class CLIModule {
};
exports.CLIModule = CLIModule;
exports.CLIModule = CLIModule = __decorate([
    (0, common_1.Module)({
        controllers: [cli_controller_1.CLIController],
        providers: [cli_service_1.CLIService],
        exports: [cli_service_1.CLIService],
    })
], CLIModule);
//# sourceMappingURL=cli.module.js.map