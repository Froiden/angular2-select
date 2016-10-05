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
const http_1 = require("@angular/http");
const Observable_1 = require("rxjs/Observable");
const forms_1 = require('@angular/forms');
const select_item_1 = require('./select-item');
const select_pipes_1 = require('./select-pipes');
const common_1 = require('./common');
const Subject_1 = require("rxjs/Subject");
require("rxjs/Rx");
let optionsTemplate = `
    <ul *ngIf="optionsOpened && options && options.length > 0 && !firstItemHasChildren"
        class="ui-select-choices dropdown-menu" role="menu">
      <li *ngFor="let o of options" role="menuitem">
        <div class="ui-select-choices-row"
             [class.active]="isActive(o)"
             (mouseenter)="selectActive(o)"
             (click)="selectMatch(o, $event)">
          <a href="javascript:void(0)" class="dropdown-item">
            <div [innerHtml]="o.text | highlight:inputValue"></div>
          </a>
        </div>
      </li>
    </ul>

    <ul *ngIf="optionsOpened && options && options.length > 0 && firstItemHasChildren"
        class="ui-select-choices dropdown-menu" role="menu">
      <li *ngFor="let c of options; let index=index" role="menuitem">
        <div class="divider dropdown-divider" *ngIf="index > 0"></div>
        <div class="dropdown-header">{{c.text}}</div>

        <div *ngFor="let o of c.children"
             class="ui-select-choices-row"
             [class.active]="isActive(o)"
             (mouseenter)="selectActive(o)"
             (click)="selectMatch(o, $event)"
             [ngClass]="{'active': isActive(o)}">
          <a href="javascript:void(0)" class="dropdown-item">
            <div [innerHtml]="o.text | highlight:inputValue"></div>
          </a>
        </div>
      </li>
    </ul>
`;
const noop = () => {
};
exports.CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR = {
    provide: forms_1.NG_VALUE_ACCESSOR,
    useExisting: core_1.forwardRef(() => SelectComponent),
    multi: true
};
let SelectComponent = class SelectComponent {
    constructor(element, http) {
        this.http = http;
        this.allowClear = false;
        this.placeholder = '';
        this.idField = 'id';
        this.textField = 'text';
        this.multiple = false;
        this.settings = '';
        this.ajaxLoad = false;
        this.searchSubject = new Subject_1.Subject();
        this.searchObserve = this.searchSubject.asObservable();
        this.requestType = "get";
        this.data = new core_1.EventEmitter();
        this.selected = new core_1.EventEmitter();
        this.removed = new core_1.EventEmitter();
        this.typed = new core_1.EventEmitter();
        this.options = [];
        this.itemObjects = [];
        //The internal data model
        this.innerValue = '';
        //Placeholders for the callbacks which are later providesd
        //by the Control Value Accessor
        this.onTouchedCallback = noop;
        this.onChangeCallback = noop;
        this.inputMode = false;
        this.optionsOpened = false;
        this.inputValue = '';
        this._items = [];
        this._disabled = false;
        this._active = [];
        this.element = element;
        this.clickedOutside = this.clickedOutside.bind(this);
        this.sendUrlRequest();
    }
    set disabled(value) {
        this._disabled = value;
        if (this._disabled === true) {
            this.hideOptions();
        }
    }
    get disabled() {
        return this._disabled;
    }
    set active(selectedItems) {
        if (!selectedItems || selectedItems.length === 0 || !selectedItems[0]) {
            this._active = [];
        }
        else {
            let areItemsStrings = typeof selectedItems[0] === 'string';
            this._active = selectedItems.map((item) => {
                let data = areItemsStrings
                    ? item
                    : { id: item[this.idField], text: item[this.textField] };
                return new select_item_1.SelectItem(data);
            });
        }
    }
    //get accessor
    get value() {
        return this.inputValue;
    }
    ;
    //set accessor including call the onchange callback
    set value(v) {
        if (v !== this.inputValue) {
            this.inputValue = v;
            this.onChangeCallback(v);
        }
    }
    //Set touched on blur
    onBlur() {
        this.onTouchedCallback();
    }
    //From ControlValueAccessor interface
    writeValue(value) {
        if (value !== this.inputValue) {
            this.inputValue = value;
        }
    }
    //From ControlValueAccessor interface
    registerOnChange(fn) {
        this.onChangeCallback = fn;
    }
    //From ControlValueAccessor interface
    registerOnTouched(fn) {
        this.onTouchedCallback = fn;
    }
    get active() {
        return this._active;
    }
    inputEvent(e, isUpMode = false) {
        // tab
        if (e.keyCode === 9) {
            return;
        }
        if (isUpMode && (e.keyCode === 37 || e.keyCode === 39 || e.keyCode === 38 ||
            e.keyCode === 40 || e.keyCode === 13)) {
            e.preventDefault();
            return;
        }
        // backspace
        if (!isUpMode && e.keyCode === 8) {
            let el = this.element.nativeElement
                .querySelector('div.ui-select-container > input');
            if (!el.value || el.value.length <= 0) {
                if (this.active.length > 0) {
                    this.remove(this.active[this.active.length - 1]);
                }
                e.preventDefault();
            }
        }
        // esc
        if (!isUpMode && e.keyCode === 27) {
            this.hideOptions();
            this.element.nativeElement.children[0].focus();
            e.preventDefault();
            return;
        }
        // del
        if (!isUpMode && e.keyCode === 46) {
            if (this.active.length > 0) {
                this.remove(this.active[this.active.length - 1]);
            }
            e.preventDefault();
        }
        // left
        if (!isUpMode && e.keyCode === 37 && this._items.length > 0) {
            this.behavior.first();
            e.preventDefault();
            return;
        }
        // right
        if (!isUpMode && e.keyCode === 39 && this._items.length > 0) {
            this.behavior.last();
            e.preventDefault();
            return;
        }
        // up
        if (!isUpMode && e.keyCode === 38) {
            this.behavior.prev();
            e.preventDefault();
            return;
        }
        // down
        if (!isUpMode && e.keyCode === 40) {
            this.behavior.next();
            e.preventDefault();
            return;
        }
        // enter
        if (!isUpMode && e.keyCode === 13) {
            if (this.active.indexOf(this.activeOption) === -1) {
                this.selectActiveMatch();
                this.behavior.next();
            }
            e.preventDefault();
            return;
        }
        let target = e.target || e.srcElement;
        if (target) {
            this.inputValue = target.value;
            if (target.value) {
                this.behavior.filter(new RegExp(common_1.escapeRegexp(this.inputValue), 'ig'));
            }
            this.doEvent('typed', this.inputValue);
        }
        if (this.settings.ajax != undefined) {
            let urlString = this.originalUrl;
            this.settings.ajax.url = urlString.replace('SEARCH_VALUE', e.target.value);
        }
        this.searchSubject.next(this.inputValue);
    }
    sendUrlRequest() {
        this.searchObserve.debounceTime(this.settings.debounceTime).subscribe(event => {
            if (this.settings.data != undefined) {
                let value = this.settings.data;
                if (!value) {
                    this._items = this.itemObjects = [];
                }
                else {
                    this._items = value.filter((item) => {
                        if ((typeof item === 'string' && item) || (typeof item === 'object' && item && item.text && item.id)) {
                            return item;
                        }
                    });
                    this.itemObjects = this._items.map((item) => (typeof item === 'string' ? new select_item_1.SelectItem(item) : new select_item_1.SelectItem({ id: item[this.idField], text: item[this.textField] })));
                }
                if (this.ajaxLoad === true) {
                    this.open();
                }
            }
            else if (this.settings.ajax != undefined) {
                // Send http request
                let headers = new http_1.Headers();
                // Add auth header
                if (this.settings.ajax.authToken != undefined) {
                    headers.append("Authorization", "Bearer " + this.settings.ajax.authToken);
                }
                // Create request options
                let requestOptions = new http_1.RequestOptions({
                    headers: headers
                });
                if (this.requestType == "get" || this.requestType == "GET") {
                    this.http.get(this.settings.ajax.url, requestOptions)
                        .map((res) => res.json())
                        .catch((error) => Observable_1.Observable.throw(error.json().error || 'Server error'))
                        .subscribe((data) => {
                        let value = this.settings.ajax.responseData(data);
                        if (!value) {
                            this._items = this.itemObjects = [];
                        }
                        else {
                            this._items = value.filter((item) => {
                                if ((typeof item === 'string' && item) || (typeof item === 'object' && item && item.text && item.id)) {
                                    return item;
                                }
                            });
                            this.itemObjects = this._items.map((item) => (typeof item === 'string' ? new select_item_1.SelectItem(item) : new select_item_1.SelectItem({ id: item[this.idField], text: item[this.textField] })));
                        }
                        if (this.ajaxLoad === true) {
                            this.open();
                        }
                    }, (error) => {
                    });
                }
                else if (this.requestType == "post" || this.requestType == "POST") {
                    this.http.post(this.settings.ajax.url, requestOptions)
                        .map((res) => res.json())
                        .catch((error) => Observable_1.Observable.throw(error.json().error || 'Server error'))
                        .subscribe((data) => {
                        let value = this.settings.ajax.responseData(data);
                        if (!value) {
                            this._items = this.itemObjects = [];
                        }
                        else {
                            this._items = value.filter((item) => {
                                if ((typeof item === 'string' && item) || (typeof item === 'object' && item && item.text && item.id)) {
                                    return item;
                                }
                            });
                            this.itemObjects = this._items.map((item) => (typeof item === 'string' ? new select_item_1.SelectItem(item) : new select_item_1.SelectItem({ id: item[this.idField], text: item[this.textField] })));
                        }
                        if (this.ajaxLoad === true) {
                            this.open();
                        }
                    }, (error) => {
                    });
                }
            }
        });
    }
    ngOnInit() {
        this.behavior = (this.firstItemHasChildren) ?
            new ChildrenBehavior(this) : new GenericBehavior(this);
        let jsonObject = this.settings;
        if (jsonObject.ajax != undefined) {
            this.ajaxLoad = true;
            this.originalUrl = jsonObject.ajax.url;
            if (jsonObject.ajax.requestType != undefined) {
                this.requestType = jsonObject.ajax.requestType;
            }
        }
        if (jsonObject.allowClear) {
            this.allowClear = jsonObject.allowClear;
        }
        if (jsonObject.multiple) {
            this.multiple = jsonObject.multiple;
        }
        if (jsonObject.placeholder) {
            this.placeholder = jsonObject.placeholder;
        }
    }
    remove(item) {
        if (this._disabled === true) {
            return;
        }
        if (this.multiple === true && this.active) {
            let index = this.active.indexOf(item);
            this.active.splice(index, 1);
            this.data.next(this.active);
            this.doEvent('removed', item);
            if (this.settings.processResults != undefined) {
                let modelValue = this.settings.processResults(this.active);
                this.onChangeCallback(modelValue);
            }
            else {
                let modelValue = this.multiProcessResults(this.active);
                this.onChangeCallback(modelValue);
            }
        }
        if (this.multiple === false) {
            this.active = [];
            this.data.next(this.active);
            this.doEvent('removed', item);
            if (this.settings.processResults != undefined) {
                let modelValue = this.settings.processResults(this.active);
                this.onChangeCallback(modelValue);
            }
            else {
                let modelValue = this.singleProcessResults(this.active);
                this.onChangeCallback(modelValue);
            }
        }
    }
    singleProcessResults(modelObject) {
        let selectValues = [];
        selectValues.push({
            id: modelObject.id,
            textValue: modelObject.text,
        });
        return selectValues;
    }
    multiProcessResults(modelObject) {
        let selectValues = [];
        modelObject.forEach((item) => {
            selectValues.push({
                id: item.id,
                textValue: item.text,
            });
        });
        return selectValues;
    }
    doEvent(type, value) {
        if (this[type]) {
            this[type].next(value);
        }
    }
    clickedOutside() {
        this.inputMode = false;
        this.optionsOpened = false;
    }
    get firstItemHasChildren() {
        return this.itemObjects[0] && this.itemObjects[0].hasChildren();
    }
    matchClick(e) {
        if (this._disabled === true) {
            return;
        }
        this.inputMode = !this.inputMode;
        if (this.inputMode === true && ((this.multiple === true && e) || this.multiple === false)) {
            this.focusToInput();
            this.open();
        }
    }
    mainClick(event) {
        if (this.inputMode === true || this._disabled === true) {
            return;
        }
        if (event.keyCode === 46) {
            event.preventDefault();
            this.inputEvent(event);
            return;
        }
        if (event.keyCode === 8) {
            event.preventDefault();
            this.inputEvent(event, true);
            return;
        }
        if (event.keyCode === 9 || event.keyCode === 13 ||
            event.keyCode === 27 || (event.keyCode >= 37 && event.keyCode <= 40)) {
            event.preventDefault();
            return;
        }
        this.inputMode = true;
        let value = String
            .fromCharCode(96 <= event.keyCode && event.keyCode <= 105 ? event.keyCode - 48 : event.keyCode)
            .toLowerCase();
        this.focusToInput(value);
        this.open();
        let target = event.target || event.srcElement;
        target.value = value;
        this.inputEvent(event);
    }
    selectActive(value) {
        this.activeOption = value;
    }
    isActive(value) {
        return this.activeOption.text === value.text;
    }
    focusToInput(value = '') {
        setTimeout(() => {
            let el = this.element.nativeElement.querySelector('div.ui-select-container > input');
            if (el) {
                el.focus();
                el.value = value;
            }
        }, 0);
    }
    open() {
        this.options = this.itemObjects
            .filter((option) => (this.multiple === false ||
            this.multiple === true &&
                !this.active.find((o) => option.text === o.text)));
        if (this.options.length > 0) {
            this.behavior.first();
        }
        this.optionsOpened = true;
    }
    hideOptions() {
        this.inputMode = false;
        this.optionsOpened = false;
    }
    selectActiveMatch() {
        this.selectMatch(this.activeOption);
    }
    selectMatch(value, e = void 0) {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        if (this.options.length <= 0) {
            return;
        }
        if (this.multiple === true) {
            this.active.push(value);
            this.data.next(this.active);
            if (this.settings.processResults != undefined) {
                let modelValue = this.settings.processResults(this.active);
                this.onChangeCallback(modelValue);
            }
            else {
                let modelValue = this.multiProcessResults(this.active);
                this.onChangeCallback(modelValue);
            }
        }
        if (this.multiple === false) {
            if (this.settings.processResults != undefined) {
                let modelValue = this.settings.processResults(value);
                this.onChangeCallback(modelValue);
            }
            else {
                let modelValue = this.singleProcessResults(value);
                this.onChangeCallback(modelValue);
            }
            this.active[0] = value;
            this.data.next(this.active[0]);
        }
        this.doEvent('selected', value);
        this.hideOptions();
        if (this.multiple === true) {
            this.focusToInput('');
        }
        else {
            this.focusToInput(select_pipes_1.stripTags(value.text));
            this.element.nativeElement.querySelector('.ui-select-container').focus();
        }
    }
};
__decorate([
    core_1.Input(), 
    __metadata('design:type', String)
], SelectComponent.prototype, "idField", void 0);
__decorate([
    core_1.Input(), 
    __metadata('design:type', String)
], SelectComponent.prototype, "textField", void 0);
__decorate([
    core_1.Input(), 
    __metadata('design:type', Object)
], SelectComponent.prototype, "settings", void 0);
__decorate([
    core_1.Input(), 
    __metadata('design:type', Boolean), 
    __metadata('design:paramtypes', [Boolean])
], SelectComponent.prototype, "disabled", null);
__decorate([
    core_1.Input(), 
    __metadata('design:type', Array), 
    __metadata('design:paramtypes', [Array])
], SelectComponent.prototype, "active", null);
__decorate([
    core_1.Output(), 
    __metadata('design:type', core_1.EventEmitter)
], SelectComponent.prototype, "data", void 0);
__decorate([
    core_1.Output(), 
    __metadata('design:type', core_1.EventEmitter)
], SelectComponent.prototype, "selected", void 0);
__decorate([
    core_1.Output(), 
    __metadata('design:type', core_1.EventEmitter)
], SelectComponent.prototype, "removed", void 0);
__decorate([
    core_1.Output(), 
    __metadata('design:type', core_1.EventEmitter)
], SelectComponent.prototype, "typed", void 0);
SelectComponent = __decorate([
    core_1.Component({
        selector: 'ng-select',
        template: `
  <div tabindex="0"
     *ngIf="multiple === false"
     (keyup)="mainClick($event)"
     [offClick]="clickedOutside"
     class="ui-select-container singleselect dropdown open">
    <div [ngClass]="{'ui-disabled': disabled}"></div>
    <div class="ui-select-match"
         *ngIf="!inputMode">
      <span tabindex="-1"
          class="btn-select btn-select-default btn-select-secondary single-span ui-select-toggle"
          (click)="matchClick($event)"
          style="outline: 0;">
        <span *ngIf="active.length <= 0" class="ui-select-placeholder text-muted">{{placeholder}}</span>
        <span *ngIf="active.length > 0" class="ui-select-match-text pull-left"
              [ngClass]="{'ui-select-allow-clear': allowClear && active.length > 0}"
              [innerHTML]="active[0].text"></span>
        <i class="dropdown-toggle pull-right"></i>
        <i class="caret pull-right"></i>
        <a *ngIf="allowClear && active.length>0" style="margin-right: 10px; padding: 0;"
          (click)="remove(activeOption)" class="close pull-right">
          &times;
        </a>
      </span>
    </div>
    <input type="text" autocomplete="false" tabindex="-1"
           [(ngModel)]="value"
           (keydown)="inputEvent($event)"
           (keyup)="inputEvent($event, true)"
           [disabled]="disabled"
           class="ui-select-search singleInput"
           *ngIf="inputMode"
           placeholder="{{active.length <= 0 ? placeholder : ''}}">
      ${optionsTemplate}
  </div>

  <div tabindex="0"
     *ngIf="multiple === true"
     (keyup)="mainClick($event)"
     (focus)="focusToInput('')"
     class="ui-select-container multiselect ui-select-multiple dropdown open">
    <div [ngClass]="{'ui-disabled': disabled}"></div>
    <span class="ui-select-match">
        <span *ngFor="let a of active">
            <span class="ui-select-match-item btn-select btn-select-default btn-select-secondary multiple-span btn-select-sm"
                  tabindex="-1"
                  type="button"
                  [ngClass]="{'btn-select-default': true}">
               <a class="close"
                  style="margin-left: 10px; padding: 0;"
                  (click)="remove(a)">&times;</a>
               <span>{{a.text}}</span>
           </span>
        </span>
    </span>
    <input type="text"
           [(ngModel)]="value"
           (keydown)="inputEvent($event)"
           (keyup)="inputEvent($event, true)"
           (click)="matchClick($event)"
           [disabled]="disabled"
           autocomplete="false"
           autocorrect="off"
           autocapitalize="off"
           spellcheck="false"
           class="ui-select-search multiInput"
           placeholder="{{active.length <= 0 ? placeholder : ''}}"
           role="combobox">
    ${optionsTemplate}
  </div>
  `,
        providers: [exports.CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
    }), 
    __metadata('design:paramtypes', [core_1.ElementRef, http_1.Http])
], SelectComponent);
exports.SelectComponent = SelectComponent;
class Behavior {
    constructor(actor) {
        this.optionsMap = new Map();
        this.actor = actor;
    }
    fillOptionsMap() {
        this.optionsMap.clear();
        let startPos = 0;
        this.actor.itemObjects
            .map((item) => {
            startPos = item.fillChildrenHash(this.optionsMap, startPos);
        });
    }
    ensureHighlightVisible(optionsMap = void 0) {
        let container = this.actor.element.nativeElement.querySelector('.ui-select-choices-content');
        if (!container) {
            return;
        }
        let choices = container.querySelectorAll('.ui-select-choices-row');
        if (choices.length < 1) {
            return;
        }
        let activeIndex = this.getActiveIndex(optionsMap);
        if (activeIndex < 0) {
            return;
        }
        let highlighted = choices[activeIndex];
        if (!highlighted) {
            return;
        }
        let posY = highlighted.offsetTop + highlighted.clientHeight - container.scrollTop;
        let height = container.offsetHeight;
        if (posY > height) {
            container.scrollTop += posY - height;
        }
        else if (posY < highlighted.clientHeight) {
            container.scrollTop -= highlighted.clientHeight - posY;
        }
    }
    getActiveIndex(optionsMap = void 0) {
        let ai = this.actor.options.indexOf(this.actor.activeOption);
        if (ai < 0 && optionsMap !== void 0) {
            ai = optionsMap.get(this.actor.activeOption.id);
        }
        return ai;
    }
}
exports.Behavior = Behavior;
class GenericBehavior extends Behavior {
    constructor(actor) {
        super(actor);
    }
    first() {
        this.actor.activeOption = this.actor.options[0];
        super.ensureHighlightVisible();
    }
    last() {
        this.actor.activeOption = this.actor.options[this.actor.options.length - 1];
        super.ensureHighlightVisible();
    }
    prev() {
        let index = this.actor.options.indexOf(this.actor.activeOption);
        this.actor.activeOption = this.actor
            .options[index - 1 < 0 ? this.actor.options.length - 1 : index - 1];
        super.ensureHighlightVisible();
    }
    next() {
        let index = this.actor.options.indexOf(this.actor.activeOption);
        this.actor.activeOption = this.actor
            .options[index + 1 > this.actor.options.length - 1 ? 0 : index + 1];
        super.ensureHighlightVisible();
    }
    filter(query) {
        let options = this.actor.itemObjects
            .filter((option) => {
            return select_pipes_1.stripTags(option.text).match(query) &&
                (this.actor.multiple === false ||
                    (this.actor.multiple === true && this.actor.active.map((item) => item.id).indexOf(option.id) < 0));
        });
        this.actor.options = options;
        if (this.actor.options.length > 0) {
            this.actor.activeOption = this.actor.options[0];
            super.ensureHighlightVisible();
        }
    }
}
exports.GenericBehavior = GenericBehavior;
class ChildrenBehavior extends Behavior {
    constructor(actor) {
        super(actor);
    }
    first() {
        this.actor.activeOption = this.actor.options[0].children[0];
        this.fillOptionsMap();
        this.ensureHighlightVisible(this.optionsMap);
    }
    last() {
        this.actor.activeOption =
            this.actor
                .options[this.actor.options.length - 1]
                .children[this.actor.options[this.actor.options.length - 1].children.length - 1];
        this.fillOptionsMap();
        this.ensureHighlightVisible(this.optionsMap);
    }
    prev() {
        let indexParent = this.actor.options
            .findIndex((option) => this.actor.activeOption.parent && this.actor.activeOption.parent.id === option.id);
        let index = this.actor.options[indexParent].children
            .findIndex((option) => this.actor.activeOption && this.actor.activeOption.id === option.id);
        this.actor.activeOption = this.actor.options[indexParent].children[index - 1];
        if (!this.actor.activeOption) {
            if (this.actor.options[indexParent - 1]) {
                this.actor.activeOption = this.actor
                    .options[indexParent - 1]
                    .children[this.actor.options[indexParent - 1].children.length - 1];
            }
        }
        if (!this.actor.activeOption) {
            this.last();
        }
        this.fillOptionsMap();
        this.ensureHighlightVisible(this.optionsMap);
    }
    next() {
        let indexParent = this.actor.options
            .findIndex((option) => this.actor.activeOption.parent && this.actor.activeOption.parent.id === option.id);
        let index = this.actor.options[indexParent].children
            .findIndex((option) => this.actor.activeOption && this.actor.activeOption.id === option.id);
        this.actor.activeOption = this.actor.options[indexParent].children[index + 1];
        if (!this.actor.activeOption) {
            if (this.actor.options[indexParent + 1]) {
                this.actor.activeOption = this.actor.options[indexParent + 1].children[0];
            }
        }
        if (!this.actor.activeOption) {
            this.first();
        }
        this.fillOptionsMap();
        this.ensureHighlightVisible(this.optionsMap);
    }
    filter(query) {
        let options = [];
        let optionsMap = new Map();
        let startPos = 0;
        for (let si of this.actor.itemObjects) {
            let children = si.children.filter((option) => query.test(option.text));
            startPos = si.fillChildrenHash(optionsMap, startPos);
            if (children.length > 0) {
                let newSi = si.getSimilar();
                newSi.children = children;
                options.push(newSi);
            }
        }
        this.actor.options = options;
        if (this.actor.options.length > 0) {
            this.actor.activeOption = this.actor.options[0].children[0];
            super.ensureHighlightVisible(optionsMap);
        }
    }
}
exports.ChildrenBehavior = ChildrenBehavior;
//# sourceMappingURL=select.js.map