(function() {

  this.UiBot = (function() {
    /**
    	 * Constructor
    	 * @param {object} config supports width, height and items properties
    	 * @returns {object} a new UiBot object
    */
    function UiBot(config) {
      this.ui_ = UiApp.createApplication();
      this.handlers_ = [];
      this.setProperties_(this.ui_, config);
    }

    /**
    	 * Create a widget and add it to the user interface
    	 * @param {object} config the widget's properties
    	 * @returns {object} the newly created widget
    */

    UiBot.prototype.addWidget = function(config) {
      var widget;
      widget = this.createWidget(config);
      this.ui_.add(widget);
      return widget;
    };

    /**
    	 * Create a widget
    	 * @param {object} config the widget's properties
    	 * @returns {object} the newly created widget
    */

    UiBot.prototype.createWidget = function(config) {
      var widget;
      if (config.wType === "HorizontalForm") {
        widget = this.createHorizontalForm_(config);
      } else {
        if (!(config.wType && this.ui_["create" + config.wType])) {
          throw new Error("Invalid Widget Type");
        }
        widget = this.ui_["create" + config.wType]();
        this.setProperties_(widget, config);
      }
      return widget;
    };

    UiBot.prototype.setProperties_ = function(widget, properties) {
      var key, value;
      for (key in properties) {
        value = properties[key];
        if (key === "data") {
          this.setData_(widget, value, properties.selected);
        } else if (key === "styles") {
          this.setStyles_(widget, value);
        } else if (key === "items") {
          this.createChildren_(widget, value);
        } else if (key === "onClick") {
          this.handlers_.push([widget, 'click', value]);
        } else {
          this.setSimpleProperty_(widget, key, value);
        }
      }
      return widget;
    };

    UiBot.prototype.createChildren_ = function(widget, items) {
      var item, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        item = items[_i];
        _results.push(widget.add(this.createWidget(item)));
      }
      return _results;
    };

    UiBot.prototype.setData_ = function(widget, data, defaultValue) {
      var i, item, itemName, itemValue, _len, _results;
      _results = [];
      for (i = 0, _len = data.length; i < _len; i++) {
        item = data[i];
        if (item instanceof Array) {
          itemName = item[0];
          itemValue = item[1];
        } else {
          itemName = itemValue = item;
        }
        widget.addItem(itemName, itemValue);
        if (itemValue === defaultValue) {
          _results.push(widget.setSelectedIndex(i));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    UiBot.prototype.setStyles_ = function(widget, styles) {
      var key, value, _results;
      if (!(styles instanceof Object)) {
        throw new Error("Styles must be an instance of object");
      }
      _results = [];
      for (key in styles) {
        value = styles[key];
        _results.push(widget.setStyleAttribute(key, value));
      }
      return _results;
    };

    UiBot.prototype.setSimpleProperty_ = function(widget, key, value) {
      if (widget["set" + (this.capitalize_(key))]) {
        if (value instanceof Array) {
          return widget["set" + (this.capitalize_(key))].apply(widget, value);
        } else {
          return widget["set" + (this.capitalize_(key))](value);
        }
      }
    };

    UiBot.prototype.capitalize_ = function(word) {
      return word[0].toUpperCase() + word.slice(1);
    };

    UiBot.prototype.createHorizontalForm_ = function(config) {
      var grid, i, row, _len, _ref;
      if (!config.items) return;
      grid = this.ui_.createGrid(config.items.length, 2);
      if (config.id) grid.setId(config.id);
      _ref = config.items;
      for (i = 0, _len = _ref.length; i < _len; i++) {
        row = _ref[i];
        row.name || (row.name = row.id);
        if (row.fieldLabel) grid.setText(i, 0, row.fieldLabel);
        if (row.wType) {
          if (row.name && !row.id) row.id = row.name;
          grid.setWidget(i, 1, this.createWidget(row));
        }
      }
      return grid;
    };

    UiBot.prototype.applyHandlers_ = function() {
      var config, createClientHandler, createServerHandler, handler, k, targetIdsToTargets, uiHandler, v, widget, _i, _len, _ref, _results,
        _this = this;
      targetIdsToTargets = function(targetIds) {
        var targetId, _i, _len, _results;
        if (typeof targetIds === "string") targetIds = [targetIds];
        _results = [];
        for (_i = 0, _len = targetIds.length; _i < _len; _i++) {
          targetId = targetIds[_i];
          _results.push(_this.ui_.getElementById(targetId));
        }
        return _results;
      };
      createClientHandler = function(targetIds, handlerType, toggle) {
        var handler, targets;
        targets = targetIdsToTargets(targetIds);
        handler = _this.ui_.createClientHandler().forTargets(targets);
        handler["set" + (_this.capitalize_(handlerType))](toggle);
        return handler;
      };
      createServerHandler = function(callback, cbElementId) {
        var cbElement, handler;
        handler = _this.ui_.createServerHandler(callback);
        if (cbElementId) {
          cbElement = _this.ui_.getElementById(cbElementId);
          handler.addCallbackElement(cbElement);
        }
        return handler;
      };
      _ref = this.handlers_;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        handler = _ref[_i];
        widget = handler[0];
        config = handler[2];
        _results.push((function() {
          var _results2;
          _results2 = [];
          for (k in config) {
            v = config[k];
            uiHandler = k === "show" ? createClientHandler(v, 'visible', true) : k === "hide" ? createClientHandler(v, 'visible', false) : k === "enable" ? createClientHandler(v, 'enabled', true) : k === "disable" ? createClientHandler(v, 'enabled', false) : k === "callback" ? createServerHandler(v, config.cbElementId) : void 0;
            if (uiHandler) {
              _results2.push(widget.addClickHandler(uiHandler));
            } else {
              _results2.push(void 0);
            }
          }
          return _results2;
        })());
      }
      return _results;
    };

    /**
    	 * Get the Google UiInstance associated with this UiBot instance 
    	 * @returns {UiApp} the Google UiApp instance
    */

    UiBot.prototype.getApp = function() {
      this.applyHandlers_();
      return this.ui_;
    };

    return UiBot;

  })();

}).call(this);
