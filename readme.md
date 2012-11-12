# UiBot for Google Apps Script

* [Overview](#overview)
* [Comparison with UI Service](#comparison)
* [Using UiBot](#using-uibot)
    * [Add UiBot to your project](#add-uibot-to-your-project)
    * [Create a blank UiBot app](#create-a-blank-uibot-app)
    * [Set basic interface properties](#set-basic-interface-properties)
    * [Add a widget to your app](#add-a-widget-to-your-app)
    * [Nest widgets inside other widgets](#nest-widgets-inside-other-widgets)
    * [Create a form](#create-a-form)
    * [Add data to a ListBox widget](#add-data-to-a-listbox-widget)
    * [Give a widget some style](#give-a-widget-some-style)
    * [Handle clicks on the client](#handle-clicks-on-the-client)
    * [Handle clicks on the server](#handle-clicks-on-the-server)
* [Code](#code)
* [Roadmap](#roadmap)
* [Contact](#contact)


## Overview
UiBot is a small helper library to make using the Google Apps Script UI Service faster and more enjoyable.  With the UiBot library, you can specify your interface using a simple declarative JSON syntax, rather then lots of chained function calls. UiBot also includes some helpers to reduce the amount of code needed to build forms. 

While you can also create a UI with Google's recently released Html Service, by using the UI Service your dialogs will share a common design with Google Docs and will work smoothly across all of the browsers supported by Google Docs.

## Comparison
###UI Service without UiBot
```javascript
function doGet() {
  var app = UiApp.createApplication()
    .setTitle('New app');
  var grid = app.createGrid(4, 2);

  var cityChoices = app.createListBox()
    .setName('city').setId('city')
    .addItem('New York').addItem('Paris')
    .addItem('London').addItem('Tokyo');
  cityChoices.setItemSelected(2, true);
  grid.setWidget(0, 0, app.createLabel('Name:'));
  grid.setWidget(0, 1, app.createTextBox()
    .setName('userName').setId('userName'));
  grid.setWidget(1, 0, app.createLabel('Age:'));
  grid.setWidget(1, 1, app.createTextBox()
    .setName('age').setId('age'));
  grid.setWidget(3, 0, app.createLabel('City'));
  grid.setWidget(3, 1, cityChoices);

  var panel = app.createVerticalPanel();
  app.add(panel);
  panel.add(grid);

  var button = app.createButton('submit');
  var handler = app.createServerHandler('b');
  handler.addCallbackElement(grid);
  var handler2 = app.createClientHandler()
    .forTargets(grid)
    .setVisible(false);
  button.addClickHandler(handler);
  button.addClickHandler(handler2);
  panel.add(button);

  return app;
}
function b() {
  Browser.msgBox('callback!');
}
```

###UI Service with UiBot
```javascript
function doGet() {
  var panel = {
    wType: 'VerticalPanel',
    items: [{
      wType: 'HorizontalForm', 
      id: 'form',
      items: [{
        fieldLabel : 'Name:', 
        wType      : 'TextBox',
        name       : 'userName'
      },{
        fieldLabel : 'Age:',
        wType      : 'TextBox',
        name       : 'age'
      },{
        blank      : true
      },{
        fieldLabel : 'City:',
        wType      : 'ListBox',
        name       : 'city',
        data       : ['New York', 'Paris', 
                      'London', 'Tokyo'],
        selected   : 'London'
      }],
    },{
      wType  : 'Button',
      text   : 'Submit',
      onClick: {
        callback  : 'b',
        cbElement : 'form',
        hide      : 'form'
      }
    }] //panel items
  }; //panel

  bot = new UiBot.UiBot({
    title: 'New App',
    items: [ panel ]
  });
  return bot.getApp();
}
UiBot.b = function() {
  Browser.msgBox('callback!');
}
```

## Using UiBot
This tutorial covers the use of UiBot and assumes some familiarity with Google Apps Script and the Google Apps Script UI Service. If you're new to either of these, you may want to take a look at the following tutorials before continuing.

* [Google Apps Script Tutorial](https://developers.google.com/apps-script/your_first_script)
* [Google UI Service Overview](https://developers.google.com/apps-script/uiapp)

### Add UiBot to your project
If you'd like to follow along, be sure to add the UiBot library to your project. The project key is *MdY_z6sqJlAAsbzYJGBr7WppQAdMKFO40* and instructions on adding a library to your development environment are [here](https://developers.google.com/apps-script/guide_libraries#includeLibrary).


### Create a blank UiBot app
```javascript
function doGet() {
  var bot = new UiBot.UiBot();
  return bot.getApp();
}
```

Google Apps Script requires you to return an _App_ object to render the interface in a web apps. We could also show our interface in a spreadsheet by changing the last line of the code above.
```javascript
function doGet() {
  var bot = new UiBot.UiBot();
  SpreadsheetApp
    .getActiveSpreadsheet()
      .show( bot.getApp() );
}
```


### Set basic interface properties
We can supply an optional configuration object to UiBot to set the title, width and height of our interface.
```javascript
function doGet() {
  var bot = new UiBot.UiBot({
    title: 'Test App!',
    width: 300,
    height: 300
  });
  return bot.getApp();
}
```

### Add a widget to your app
When defining widgets with UiBot, you must specify a widget type using the _wType_ property. Widgets may also have other properties (the part after the 'set' in the UI Service documentation). For example, the api function _setText_ is equivalent to the UiBot property _text_). A full list of the widget types and their properties is [here](https://developers.google.com/apps-script/service_ui). 

Let's create a label on our interface
```javascript
function doGet() {
  var bot = new UiBot.UiBot();
 
  bot.addWidget({
    wType : 'Label',
    text  : 'This is a label!'
  });
  
  return bot.getApp();
}
```

### Nest widgets inside other widgets
Widgets that can contain other widgets (such as panels) have an _items_ property that can be filled with an array of other widgets.  Let's create a panel with our label inside.

```javascript
function doGet() {
  var bot = new UiBot.UiBot();
 
  bot.addWidget({ 
    wType : 'VerticalPanel',
    items : [{
      wType : 'Label',
      text  : 'This is a label!'
    }]
  });

  return bot.getApp();
}
```

Of course, there's no reason to create a panel for a single widget...

```javascript
function doGet() {
  var bot = new UiBot.UiBot();
 
  bot.addWidget({ 
    wType : 'VerticalPanel',
    items : [{
      wType : 'Label',
      text  : 'This is a label!'
    },{
      wType : 'Label',
      text  : 'This is a second label!'
    }]
  });

  return bot.getApp();
}
```

We can nest widgets inside of the UiBot object too...
```javascript
function doGet() {
  var bot = new UiBot.UiBot({

    title: 'Test App!',
    items: [{
      wType : 'VerticalPanel',
    
      items : [{
        wType : 'Label',
        text  : 'This is a label!'
      },{
        wType : 'Label',
        text  : 'This is a second label!'
      }]    //panel items
    
    }]  //app items

  });

  return bot.getApp();
}
```

Nesting is a choice though - we can also break out each widget into separate objects (somewhere between these extremes is usually the best choice to write clear code).

```javascript
function doGet() {

  var label1 = {
    wType : 'Label',
    text  : 'This is a label!'
  }

  var label2 = {
    wType : 'Label',
    text  : 'This is a second label!'
  }

  var panel = {
    wType : 'VerticalPanel',
    items : [ label1, label2 ]
  }

  var bot = new UiBot.UiBot({
    title: 'Test App!',
    items: [ panel ]
  });

  return bot.getApp();

}
```

### Create a form
We often need create forms with labels on the left and widgets on the right, so UiBot has a special helper for this. The _HorizontalForm_ widget type automatically creates a grid with two columns and the correct number of rows. A new _fieldLabel_ property in each widget makes it easy to set a label for the widget. You can also add a blank row to separate sections of your form using the _blank_ property.

```javascript
function doGet() {
  
  var form = {
    wType: 'HorizontalForm', 
    items: [{
      fieldLabel : 'Name:', 
      wType      : 'TextBox',
      name       : 'userName'
    },{
      fieldLabel : 'Age:',
      wType      : 'TextBox',
      name       : 'age'
    },{
      blank      : true
    },{
      fieldLabel : 'City:',
      wType      : 'TextBox',
      name       : 'city'
    }]
  };
  
  var bot = new UiBot.UiBot({
    title: 'Test App!',
    items: [ form ]
  });

  return bot.getApp();

}
```
### Add data to a ListBox widget
It's also pretty common to create listboxes with data in them, so UiBot adds optional _data_ and _selected_ properties to the _ListBox_ widget.

```javascript
function doGet() {

  var form = {
    wType : 'HorizontalForm', 
    items : [{
      fieldLabel : 'Period:',
      wType      : 'ListBox',
      name       : 'periodList',
      data       : ["Day", "Month","Quarter", "Year"],
      selected   : "Month"
    }]
  };
  
  var bot = new UiBot.UiBot({
    title: 'Test App!',
    items: [ form ]
  });

  return bot.getApp();
}
```

### Give a widget some style
To change the look of each widget, you can use the optional _styles_ property which accepts a set of css styles.

```javascript
function doGet() {

  var bot = new UiBot.UiBot({

    title: 'Test App!',
    items: [{
      wType : 'Label',
      text  : 'This is a label!',     
      styles : { 
        'font-size' : 20,
        'color'     : 'blue' 
      }
    }]

  });

  return bot.getApp();
}
```

### Handle clicks on the client
onClick handlers can also work on the client side to offer a faster response to the user. Let's create handlers that toggle two labels. The _show_ and _hide_ properties accept an array of widget ids.  There are also properties to _enable_ and _disable_ widgets, which also take an array of widget ids.

```javascript
function doGet() {

  var bot = new UiBot.UiBot({

    title: 'ui test',
    items: [{
    
      wType   : 'Label',
      text    : 'This is label 1',
      id      : 'label1',
      styles  : { 'font-size' : 30 },
      onClick : { 'show' : 'label2' }
    
    },{
    
      wType   : 'Label',
      text    : 'This is label 2',
      id      : 'label2',
      visible : false,
      styles  : { 'font-size' : 30 },
      onClick : { 'hide' : ['label1', 'label2'] }
    
    }]

  });

  return bot.getApp();
}
```

### Handle clicks on the server
UiBot also makes it simple to add server side click handlers to buttons and other widgets. An _onClick_ property can accept an object with the name of a _callback_ function and an optional element id to be passed to this  function (the _cbElementId_ property). Note that Google Apps Script scopes the callback to the libary where it was created, so for now your server callback must be placed in the UiBot namespace (see the example below).


```javascript
function doGet() {

  var buttons = {
    wType : 'HorizontalPanel',
    items : [{
      wType   : 'Button',
      text    : 'Submit',
      onClick : {
        callback: 'submitHandler',
        cbElementId: 'mainForm'
      }
    }] 
  };

  var form = {
    wType : 'HorizontalForm', 
    id    : 'mainForm',
    items : [{
      fieldLabel : 'Period:',
      wType      : 'ListBox',
      name       : 'period',
      data       : ["Day", "Month","Quarter", "Year"],
      selected   : "Month"
    }]
  };

  var bot = new UiBot.UiBot({
    title: 'Test App!',
    items: [ form, buttons ]
  });

  return bot.getApp();

}

UiBot.submitHandler = function(e) {
  Browser.msgBox(e.parameter.period);
}
```

## Code
The code for UiBot is released under the permissive MIT license and was written in [CoffeeScript](http://coffeescript.org) and compiled to Javascript. It is available on Github at https://github.com/gotdan/UiBot. Inspiration for the design came from [ExtJs](http://www.sencha.com/products/extjs/)

## Roadmap
Future additions to UiBot may include support for other handlers and for validators. For now,  you can build most of your interface in UiBot and then write non-click related handlers and validators using the traditional UI Service api. 

## Contact
Please feel free contact me with any questions or suggestions - dan at dan-gottlieb dot com.

