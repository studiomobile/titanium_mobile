/**
 * Appcelerator Titanium Mobile
 * Copyright (c) 2012 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 */

var PersistentHandle = require('ui').PersistentHandle;

var TAG = "TabGroup";

exports.bootstrap = function(Titanium) {

	var TabGroup = Titanium.UI.TabGroup;

	// Set constants for representing states for the tab group
	TabGroup.prototype.state = {closed: 0, opening: 1, opened: 2};

	function createTabGroup(scopeVars, options) {
		var tabGroup = new TabGroup(options);

		if (options) {
			tabGroup._tabs = options.tabs || [];
		} else {
			tabGroup._tabs = [];
		}

		// Keeps track of the current tab group state
		tabGroup.currentState = tabGroup.state.closed;

		// Set the activity property here since we bind it to _internalActivity for window proxies by default
		Object.defineProperty(TabGroup.prototype, "activity", { get: tabGroup.getActivity});

		return tabGroup;
	}

	Titanium.UI.createTabGroup = createTabGroup;

	var _open = TabGroup.prototype.open;
	TabGroup.prototype.open = function(options) {

		if (this.currentState == this.state.opened) {
			return;
		}
		
		this.currentState = this.state.opening;

		// Retain the tab group until is has closed.
		var handle = new PersistentHandle(this);

		var self = this;
		this.on("close", function(e) {
			if (e._closeFromActivityForcedToDestroy) {
				if (kroll.DBG) {
					kroll.log(TAG, "Tabgroup is closed because the activity is forced to destroy by Android OS.");
				}
				return;
			}

			self.currentState = self.state.closed;
			handle.dispose();

			if (kroll.DBG) {
				kroll.log(TAG, "Tabgroup is closed normally.");
			}
		});

		this.setTabs(this._tabs);
		_open.call(this, options);

		this.currentState = this.state.opened;
	}

	var _addTab = TabGroup.prototype.addTab;
	TabGroup.prototype.addTab = function(tab) {
		this._tabs.push(tab);
		if (this.currentState == this.state.opened) {
			_addTab.call(this, tab);
		}
	}

	TabGroup.prototype.getTabs = function() {
		return this._tabs;
	}

	var _setTabs = TabGroup.prototype.setTabs;
	TabGroup.prototype.setTabs = function(tabs) {

		if (!Array.isArray(tabs)) {
			kroll.log(TAG, "Invalid type of tabs for setTabs()");
			return;
		}

		if (this.currentState != this.state.opened) {
			this._tabs = tabs;
			_setTabs.call(this, tabs);
			
		} else {
			kroll.log(TAG, "Cannot set tabs after tab group opens");
		}
	}

	Object.defineProperty(TabGroup.prototype, "tabs", { get: TabGroup.prototype.getTabs, set: TabGroup.prototype.setTabs });

}

