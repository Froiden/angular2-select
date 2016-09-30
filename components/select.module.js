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
const core_1 = require('@angular/core');
const common_1 = require('@angular/common');
const forms_1 = require('@angular/forms');
const http_1 = require("@angular/http");
const select_1 = require('./select/select');
const select_pipes_1 = require('./select/select-pipes');
const off_click_1 = require('./select/off-click');
let SelectModule = class SelectModule {
};
SelectModule = __decorate([
    core_1.NgModule({
        imports: [common_1.CommonModule, forms_1.FormsModule, http_1.HttpModule],
        declarations: [select_1.SelectComponent, select_pipes_1.HighlightPipe, off_click_1.OffClickDirective],
        exports: [select_1.SelectComponent, select_pipes_1.HighlightPipe, off_click_1.OffClickDirective]
    }), 
    __metadata('design:paramtypes', [])
], SelectModule);
exports.SelectModule = SelectModule;
//# sourceMappingURL=select.module.js.map