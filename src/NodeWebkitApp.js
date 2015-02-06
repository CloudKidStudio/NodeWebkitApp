(function(window, undefined){

	window.cloudkid = window.cloudkid || {};

	/**
	*  A base web kit application
	*  @class NodeWebkitApp
	*  @namespace cloudkid
	*  @constructor
	*  @param {Number} [updaterTime=2] The minimum amount of time before reminding the user they're
	*          is a new update for the application.
	*/
	var NodeWebkitApp = function(updaterTime)
	{
		/**
		*  The optional utility that checks for update
		*  @property {cloudkid.UpdateChecker} updater
		*/
		this.updater = null;

		/**
		*  The file browser which uses a file input form element behind the scenes
		*  the Browser class can also be called statically
		*  @property {cloudkid.Browser} browser
		*/
		this.browser = null;

		/**
		*  Application only, the node-webkit gui module
		*  @property {nw.gui} gui
		*/
		this.gui = null;

		/**
		*  The main node webkit window
		*  @property {Window} main
		*/
		this.main = null;

		/**
		*  If we can resize the window
		*  @property {Boolean} resizable
		*/
		this.resizable = true;

		/**
		*  The contents of the package JSON file
		*  @property {object} packageData
		*/
		this.packageData = null;

		if (APP)
		{
			var gui = this.gui = require('nw.gui');
			var main = this.main = this.gui.Window.get();
			var fs = require('fs');

			var pack = this.packageData = JSON.parse(fs.readFileSync('package.json'));
			var winConfig = pack.window;

			this.resizable = winConfig.resizable !== undefined ? 
				winConfig.resizable : true;

			if (DEBUG)
			{
				// Show the development tools
				main.showDevTools();

				// Add a listener for debug function key commands
				window.addEventListener('keydown', this._onKeyDown.bind(this));
			}

			// Listen for when the window close and remember window size
			main.on('close', this._onClose.bind(this));

			// Load the saved window size
			try
			{
				var rect = JSON.parse(localStorage.getItem('windowSettings') || 'null');
				if (rect)
				{
					if (this.resizable)
					{
						main.width = rect.width;
						main.height = rect.height;
					}
					else
					{
						main.height = winConfig.height;
						main.width = winConfig.width;
					}
					main.x = rect.x;
					main.y = rect.y;
				}
				else if (!this.resizable)
				{
					main.height = winConfig.height;
					main.width = winConfig.width;
				}
			}
			catch(e){}

			// Check for application updates
			if (cloudkid.UpdateChecker)
			{
				this.updater = new cloudkid.UpdateChecker(updaterTime);
			}

			// Initialize the browser utility
			if (cloudkid.Browser)
			{
				this.browser = cloudkid.Browser.init();
			}

			// The application is hidden by default, lets show it
			main.show();
		}

		// Catch any uncaught errors or fatal exceptions
		if (APP)
		{
			process.on("uncaughtException", this._handleErrors.bind(this));
		}
		if (WEB)
		{
			window.onerror = this._handleErrors.bind(this);
		}
	};

	// Reference to the prototype
	var p = NodeWebkitApp.prototype;

	if (DEBUG)
	{
		/**
		*  Key handler for the window key down
		*  @method _onKeyDown
		*  @private
		*  @param {event} e The window keyboard event
		*/
		p._onKeyDown = function(e)
		{
			if (e.keyIdentifier === 'F12')
			{
				this.main.showDevTools();
			}
			else if (e.keyIdentifier === 'F5')
			{
				location.reload();
			}
		};
	}

	/**
	*  Handle any fatal or uncaught errors
	*  @method _handleErrors
	*  @method private
	*  @param {error} e The error thrown
	*/
	p._handleErrors = function(e)
	{
		if (RELEASE)
		{
			alert(e);
		}
		if (DEBUG)
		{
			console.error(e);
			if (e.stack)
			{
				console.error(e.stack);
			}
		}
	};

	/**
	*  Handler when the main node-webkit window closes
	*  @method _onClose
	*  @method private
	*/
	p._onClose = function()
	{
		var main = this.main;
		var gui = this.gui;

		var rect = {
			x : main.x,
			y : main.y
		};

		if (this.resizable)
		{
			rect.width = main.width;
			rect.height = main.height;
		}

		localStorage.setItem('windowSettings', JSON.stringify(rect));
		main.hide();

		if (this.browser)
		{
			this.browser.destroy();
			this.browser = null;
		}

		if (this.updater)
		{
			this.updater.destroy();
			this.updater = null;
		}

		this.close();
		gui.App.closeAllWindows();
		gui.App.quit();
	};

	/**
	*  Called whenever the application closes
	*  @method close
	*/
	p.close = function()
	{
		// Implementation specific
	};

	// Assign to namespace
	namespace('cloudkid').NodeWebkitApp = NodeWebkitApp;

}(window));