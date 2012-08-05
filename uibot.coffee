class @UiBot

	###*
	 * Constructor
	 * @param {object} config supports width, height and items properties
	 * @returns {object} a new UiBot object
	 ###
	constructor: (config) ->
		@ui_ = UiApp.createApplication()
		@handlers_ = []
		@setProperties_ @ui_, config

	###*
	 * Create a widget and add it to the user interface
	 * @param {object} config the widget's properties
	 * @returns {object} the newly created widget
	 ###
	addWidget: (config) ->
		widget = @createWidget(config)
		@ui_.add widget
		return widget

	###*
	 * Create a widget
	 * @param {object} config the widget's properties
	 * @returns {object} the newly created widget
	 ###
	createWidget: (config) ->
		if config.wType is "HorizontalForm"
			widget = @createHorizontalForm_(config)
		else
			unless config.wType and @ui_["create#{config.wType}"]
				throw new Error("Invalid Widget Type")
			widget = @ui_["create#{config.wType}"]()
			@setProperties_(widget, config)
		return widget

	setProperties_: (widget, properties) ->
		for key, value of properties
			if key is "data"
				@setData_(widget, value, properties.selected)
			else if key is "styles"
				@setStyles_(widget, value)
			else if key is "items"
				@createChildren_(widget, value)
			else if key is "onClick"
				#process after all elements are added
				@handlers_.push [widget,'click', value]
			else
				@setSimpleProperty_(widget, key, value)

		return widget

	createChildren_: (widget, items) ->
		for item in items
			widget.add @createWidget(item)

	setData_: (widget, data, defaultValue) ->
		for item, i in data
			if (item instanceof Array)
				itemName  = item[0]
				itemValue = item[1]
			else
				itemName = itemValue = item

			widget.addItem(itemName, itemValue)
			if itemValue is defaultValue
				widget.setSelectedIndex(i)

	setStyles_: (widget, styles) ->
		unless (styles instanceof Object)
			throw new Error("Styles must be an instance of object")
		for key, value of styles
			widget.setStyleAttribute(key, value)

	setSimpleProperty_: (widget, key, value) ->
		if widget["set#{@capitalize_ key}"]
			if (value instanceof Array)
				widget["set#{@capitalize_ key}"](value...)
			else
				widget["set#{@capitalize_ key}"](value)

	capitalize_: (word) ->
		word[0].toUpperCase() + word[1..-1]

	createHorizontalForm_: (config) ->
		return unless config.items
		grid = @ui_.createGrid(config.items.length, 2)
		grid.setId(config.id) if config.id

		for row, i in config.items
			row.name ||= row.id
			if row.fieldLabel
				grid.setText(i, 0, row.fieldLabel)
			if row.wType
				if row.name and !row.id
					row.id = row.name
				grid.setWidget i, 1, @createWidget(row) 

		return grid

	applyHandlers_: ->
		targetIdsToTargets = (targetIds) =>
			if typeof(targetIds) is "string"
				targetIds = [targetIds] 
			(@ui_.getElementById(targetId) for targetId in targetIds)

		createClientHandler = (targetIds, handlerType, toggle) =>
			targets = targetIdsToTargets(targetIds)
			handler = @ui_.createClientHandler().forTargets(targets)
			handler["set#{@capitalize_(handlerType)}"](toggle)
			return handler

		createServerHandler = (callback, cbElementId) =>
			handler = @ui_.createServerHandler callback
			if cbElementId
				cbElement = @ui_.getElementById cbElementId
				handler.addCallbackElement(cbElement)
			return handler

		for handler in @handlers_
			widget = handler[0]
			config = handler[2]

			for k, v of config
				uiHandler =
					if k is "show"
						createClientHandler(v,'visible', true)
					else if k is "hide"
						createClientHandler(v, 'visible', false)
					else if k is "enable"
						createClientHandler(v, 'enabled', true)
					else if k is "disable"
						createClientHandler(v, 'enabled', false)
					else if k is "callback"
						createServerHandler(v, config.cbElementId)	
				widget.addClickHandler(uiHandler) if uiHandler
	
	###*
	 * Get the Google UiInstance associated with this UiBot instance 
	 * @returns {UiApp} the Google UiApp instance
	 ###
	getApp: ->
		@applyHandlers_()
		return @ui_