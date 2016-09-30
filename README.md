# Angular2 Select component
## froiden-angular2-select [![npm version](https://badge.fury.io/js/froiden-angular2-select.svg)](http://badge.fury.io/js/froiden-angular2-select) [![npm downloads](https://img.shields.io/npm/dm/froiden-angular2-select.svg)](https://npmjs.org/froiden-angular2-select)

## Getting started

### Install

```
npm install --save froiden-angular2-select
```

### Configuration

#### Systemjs

In `systemjs.config.js` add `froiden-angular2-select` to map and package:

```javascript
var map = {
	// others...,
	'froiden-angular2-select': 'node_modules/froiden-angular2-select'
};

var packages = {
	// others...,
	'froiden-angular2-select': {
		main: 'angular2-select.js',
		defaultExtension: 'js'
	}
};
```

### Usage

Import the `SelectModule` and define it as one of the imports of your
application module:

```typescript
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {SelectModule} from 'froiden-angular2-select/angular2-select';

import {AppComponent} from './app.component';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        SelectModule
    ],
    declarations: [
        AppComponent
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule { }
```


Add the following HTML to the component template in which you want to use the
select component:

```html
<ng-select name="countries" [(ngModel)]="countries"
           [dataObject]="selectOptions">
</ng-select>
```

Within the component class you have to set the countries and dataObject variable.

```typescript
  public countries : any;
  private selectOptions = {
      "multiple" : true,
      "ajaxLoad" : true,
      "allowClear" : true,
      "placeholder" : "Select countries...",
      "url"      : YOUR API URL,
      "authToken": AUTH TOKEN FOR Request,
      setResponseValue : (response : any) => {
          let currentValue = response.data;
          let value : Array<any> = [];
          currentValue.forEach((item : {id : number, name : string}) => {
              value.push({
                  id  : item.id,
                  text: item.name
              });
          });
          return value;
      },
      setNgModelObject : (modelObject : any) => {
          let selectValues : Array<any> = [];
          modelObject.forEach((item : {id : number, text : string}) => {
              selectValues.push({
                  id : item.id,
                  textValue : item.text,
              });
          });
          return selectValues;
      }
  };
  ```

## Input properties

You need set `[(ngModel)]` two way property binding and `dataObject` input property in ng-select tag:
