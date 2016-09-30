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
const common_1 = require('./common');
let HighlightPipe = class HighlightPipe {
    transform(value, args) {
        if (args.length < 1) {
            return value;
        }
        let query = args[0];
        if (query) {
            let tagRE = new RegExp('<[^<>]*>', 'ig');
            // get ist of tags
            let tagList = value.match(tagRE);
            // Replace tags with token
            let tmpValue = value.replace(tagRE, '$!$');
            // Replace search words
            value = tmpValue.replace(new RegExp(common_1.escapeRegexp(query), 'gi'), '<strong>$&</strong>');
            // Reinsert HTML
            for (let i = 0; value.indexOf('$!$') > -1; i++) {
                value = value.replace('$!$', tagList[i]);
            }
        }
        return value;
    }
};
HighlightPipe = __decorate([
    core_1.Pipe({ name: 'highlight' }), 
    __metadata('design:paramtypes', [])
], HighlightPipe);
exports.HighlightPipe = HighlightPipe;
function stripTags(input) {
    let tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
    let commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    return input.replace(commentsAndPhpTags, '').replace(tags, '');
}
exports.stripTags = stripTags;
//# sourceMappingURL=select-pipes.js.map