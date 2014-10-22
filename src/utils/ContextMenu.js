(function(undefined){
	
	/**
	*  A class to make replacement context menus easier to use. Create a ContextMenu and then use
	*  attach() to attach it to all the DOM elements that should use it as a menu.
	*  Example of creation:
	*
	*	var menu = new ContextMenu(
	*		[
	*			{
	*				label: "My menu item",//Required
	*				callback: function(){},//Required for most items
	*				tooltip: "My optional tooltip",//optional
	*				checked: false,//Optional, omitting makes a normal item instead of a checkbox
	*				enabled: false,//Optional, defaults to true
	*				submenu://optional submenu
	*				[
	*					"-",
	*					{
	*						label: "Checked?",
	*						callback: function(){},
	*						checked: true
	*					}
	*				]
	*			},
	*			"-",
	*			{
	*				label: "A simple entry",
	*				callback: function(){}
	*			}
	*		]);
	*
	*  @class ContextMenu
	*  @namespace cloudkid
	*  @constructor
	*  @param {nw.gui.Menu|Array} menu A menu to use as the context menu or an array of simplified
	*                                  entries, with entries in the form of
	*                                  config objects or "-" to note a separator.
	*/
	var ContextMenu = function(menu)
	{
		/**
		* The native menu object.
		* @property {nw.gui.Menu} menu
		*/
		this.menu = Array.isArray(menu) ? ContextMenu.createMenu(menu) : menu;
		/**
		* The list of DOM elements that this menu is attached to.
		* @property {Array} _elements
		* @private
		*/
		this._elements = [];
		/**
		* If the context menu is enabled. Even while disabled, it will still block the default
		* context menu on the attached DOM elements.
		* @property {Boolean} _enabled
		* @private
		*/
		this._enabled = true;
		
		this.onOpen = this.onOpen.bind(this);
	};
	
	var p = ContextMenu.prototype = {};
	
	/**
	 * If the context menu is enabled. Even while disabled, it will still block the default
	 * context menu on the attached DOM elements.
	 * @property {Boolean} enabled
	 */
	Object.defineProperty(p, "enabled",
	{
		get: function() { return this._enabled; },
		set: function(value)
		{
			this._enabled = value;
		}
	});
	
	/**
	 * Finds the first menu item with the specified label.
	 * @param {String} label The menu label to search for
	 * @return {nw.gui.MenuItem} The menu item if it exists, or null.
	 */
	p.getItemByLabel = function(label, menu)
	{
		if(!menu)
			menu = this.menu;
		for(var i = 0; i < menu.items.length; ++i)
		{
			var item = menu.items[i];
			if(item.label == label)
				return item;
			else if(item.submenu)
			{
				var recursiveResult = this.getItemByLabel(label, item.submenu);
				if(recursiveResult)
					return recursiveResult;
			}
		}
		return null;
	};
	
	/**
	 * Attaches the context menu to a specified DOM element.
	 * @param  {HTMLElement} domElement The DOM element that should use this menu.
	 */
	p.attach = function(domElement)
	{
		var index = this._elements.indexOf(domElement);
		if(index == -1)
		{
			this._elements.push(domElement);
			domElement.addEventListener("contextmenu", this.onOpen);
		}
	};
	
	/**
	 * Listener function for the context menu event on the attached DOM elements.
	 * @param {MosueEvent} ev The mouse event.
	 * @private
	 */
	p.onOpen = function(ev)
	{
		ev.preventDefault();
		if(this._enabled)
			this.menu.popup(ev.x, ev.y);
		return false;
	};
	
	/**
	* Removes the context menu from a specified DOM element.
	* @param  {HTMLElement} domElement The DOM element that should no longer use this menu.
	*/
	p.remove = function(domElement)
	{
		var index = this._elements.indexOf(domElement);
		if(index >= 0)
		{
			this._elements.splice(index, 1);
			domElement.removeEventListener("contextmenu", this.onOpen);
		}
	};
	
	/**
	* Destroys the menu.
	* @method destroy
	*/
	p.destroy = function()
	{
		for(var i = this._elements.length - 1; i >= 0; --i)
		{
			this._elements[i].removeEventListener("contextmenu", this.onOpen);
		}
		this._elements = null;
		this.onOpen = null;
		this.menu = null;
	};
	
	/**
	 * Creates a nw.gui.Menu from an array of items.
	 * @param {Array} menuArray The array of menu initialization data.
	 * @static
	 */
	ContextMenu.createMenu = function(menuArray)
	{
		var gui = require("nw.gui");
		var menu = new gui.Menu();
		for(var i = 0; i < menuArray.length; ++i)
		{
			var entry = menuArray[i];
			var item;
			if(entry == "-")
			{
				item = new gui.MenuItem({type: "separator"});
			}
			else
			{
				item = new gui.MenuItem(
					{
						label: entry.label,
						tooltip: entry.tooltip,
						type: entry.hasOwnProperty("checked") ? "checkbox" : "normal",
						checked: entry.checked,
						enabled: entry.hasOwnProperty("enabled") ? entry.enabled : true
					});
				//add the callback separately in case it doesn't exist
				if(entry.callback)
					item.click = entry.callback;
				if(entry.submenu)
				{
					item.submenu = ContextMenu.createMenu(entry.submenu);
				}
			}
			menu.append(item);
		}
		return menu;
	};
	
	// Assign to namespace
	namespace('cloudkid').ContextMenu = ContextMenu;

}());