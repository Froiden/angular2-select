"use strict";
class SelectItem {
    constructor(source) {
        if (typeof source === 'string') {
            this.id = this.text = source;
        }
        if (typeof source === 'object') {
            this.id = source.id || source.text;
            this.text = source.text;
            this.properties = source.properties;
            if (source.children && source.text) {
                this.children = source.children.map((c) => {
                    let r = new SelectItem(c);
                    r.parent = this;
                    return r;
                });
                this.text = source.text;
            }
        }
    }
    fillChildrenHash(optionsMap, startIndex) {
        let i = startIndex;
        this.children.map((child) => {
            optionsMap.set(child.id, i++);
        });
        return i;
    }
    hasChildren() {
        return this.children && this.children.length > 0;
    }
    getSimilar() {
        let r = new SelectItem(false);
        r.id = this.id;
        r.text = this.text;
        r.parent = this.parent;
        return r;
    }
}
exports.SelectItem = SelectItem;
//# sourceMappingURL=select-item.js.map