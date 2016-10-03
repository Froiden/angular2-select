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
           [settings]="selectOptions">
</ng-select>
```

Within the component class you have to set the countries and dataObject variable. We can set select2 data using ajax or without
ajax.

### Without Ajax request

```typescript
    public countries : any;
    private selectOptions = {
        "multiple" : true,
        "allowClear" : true,
        "debounceTime" : 300,
        "placeholder" : "Select countries...",
        data :   [
            {
                "id" : 1,
                "text" : "India"
            },
            {
                "id" : 2,
                "text" : "Bangladesh"
            },
            .....
        ],
        processResults : (modelObject : any) => {
            let selectValues : Array<any> = [];
            modelObject.forEach((item : {id : number, text : string}) => {
                selectValues.push({
                    id : item.id,
                    textValue : item.text,
                });
            });
            return selectValues;
        }
    }
```

### With Ajax request

```typescript
    public countries : any;
    private selectOptions = {
        "multiple" : true,
        "allowClear" : true,
        "debounceTime" : 300,
        "placeholder" : "Select countries...",
        ajax : {
            "requestType" : "get",
            "url"      : 'http://demo.com/api/countries?fields=id|name&limit=-1&filters={"name":{"type":"search","value":"SEARCH_VALUE"}}',
            "authToken": AUTH TOKEN IF REQUIRED,
            responseData : (response : any) => {
                let currentValue = response.data;
                let value : Array<any> = [];
                currentValue.forEach((item : {id : number, name : string}) => {
                    value.push({
                        id  : item.id,
                        text: item.name
                    });
                });
                return value;
            }
        },
        processResults : (modelObject : any) => {
            let selectValues : Array<any> = [];
            modelObject.forEach((item : {id : number, text : string}) => {
                selectValues.push({
                    id : item.id,
                    textValue : item.text,
                });
            });
            return selectValues;
        }
    }
```
NOTE: Always put `SEARCH_VALUE` in your `url`. We will automatically replace `SEARCH_VALUE` with input entered by you.

## [(ngModel)]
You need to set `[(ngModel)]` with your Component variable for which you want two way data binding.

## Input properties (selectOptions)

### multiple

*true/false*

A boolean to choose between single and multi-select.

### allowClear

*true/false*

If set to true, a button with a cross that can be used to clear the currently
selected option is shown if an option is selected.

### debounceTime

*Integer value*

Time for which you want to wait to appear select options.

### placeholder

*default: ''*

The placeholder value is shown if no option is selected.

### processResults

Callback function to set ngModel array of object.
For single select:

```
processResults : (modelObject : any) => {
    let selectValues : Array<any> = [];
    selectValues.push({
        id : item.id,
        textValue : item.text,
    });
    return selectValues;
}
```

For multiple select :

```
processResults : (modelObject : any) => {
    let selectValues : Array<any> = [];
    modelObject.forEach((item : {id : number, text : string}) => {
        selectValues.push({
            id : item.id,
            textValue : item.text,
        });
    });
    return selectValues;
}
```

## Input properties (selectOptions.ajax)
If you want to use ajax request to fetch data from url and want to render this data into your select option then we will use
following properties:

### requestType

*get/post*

Request type for url address.

### url

*string*

URL address from where you will fetch data for select options.
NOTE: Always put `SEARCH_VALUE` in your `url`. We will automatically replace `SEARCH_VALUE` with input entered by you.

### authToken (optional)

*string*

If your url endpoint uses auth token then assign to authToken

### responseData

Callback function to set select option values:

```
responseData : (response : any) => {
    let currentValue = response.data;
    let value : Array<any> = [];
    currentValue.forEach((item : {id : number, name : string}) => {
        value.push({
            id  : item.id,
            text: item.name
        });
    });
    return value;
}
```