(function(undefined){
	
	var gui = require('nw.gui');
	
	var ModalManager = {};
	
	/**
	 * Initialization data for dialogs, stored by dialog type.
	 * @property {Object} _dialogInitData
	 * @static
	 * @private
	 */
	ModalManager._dialogInitData = {};
	
	/**
	* Entries for all active dialogs, to facilitate keeping them on top as well as
	* callbacks and cleanup.
	* @property {Array} _activeDialogs
	* @static
	* @private
	*/
	ModalManager._activeDialogs = [];
	
	/**
	 * Registers some basic dialog window information under a name for easy creation later.
	 * @method registerDialog
	 * @param {String} type The type of dialog. This value will be the one referenced when creating
	 *                      dialogs with ModalManager.open().
	 * @param {String} pageUrl The HTML page that should be opened by the dialog.
	 * @param {Object} windowOptions Standard Node WebKit window options.
	 * @static
	 */
	ModalManager.registerDialog = function(type, pageUrl, windowOptions)
	{
		//modal dialogs should always have focus when they open
		windowOptions.focus = true;
		//create an entry for later retrieval
		ModalManager._dialogInitData[type] =
		{
			url: pageUrl,
			options: windowOptions
		};
	};
	
	/**
	 * Opens a modal dialog.
	 * @method open
	 * @param {String} type The type of dialog to create.
	 * @param {nw.gui.Window} parent The parent window of the dialog.
	 * @param {Function} callback A callback function for when the dialog is closed.
	 *                            Parameters are dependent on what the specific dialog code
	 *                            sends.
	 * @param {Object} dialogOptions Options specific to the dialog system. This will be passed on
	 *                               to the dialog as initialization data.
	 * @return {Boolean} true if the dialog was opened successfully, false if the dialog type
	 *                        does not exist or the window already has an open modal dialog.
	 * @static
	 */
	ModalManager.open = function(type, parent, callback, dialogOptions)
	{
		var dialogData = ModalManager._dialogInitData[type];
		if(!dialogData)
			return false;
		for(var i = 0; i < ModalManager._activeDialogs.length; ++i)
		{
			if(ModalManager._activeDialogs[i].parentWindow == parent)
				return false;
		}
		//create an entry to keep track of the window on
		var data =
		{
			parentWindow: parent,
			focusListener: onFocus.bind(parent),
			closedListener: onClosed.bind(parent),
			callback: callback,
			dialogWindow: gui.Window.open(dialogData.url, dialogData.options)
		};
		ModalManager._activeDialogs.push(data);
		//add an input blocker to the parent window
		var doc = parent.window.document;
		var blocker = doc.createElement("div");
		blocker.className = "modal-dialog-blocker";
		blocker.style.width = "100%";
		blocker.style.paddingBottom = "100%";
		blocker.style.position = "absolute";
		blocker.style.zIndex = "10";
		parent.window.document.body.appendChild(blocker);
		//add listeners to the parent window to prevent focus nonsense
		parent.addListener("focus", data.focusListener);
		parent.addListener("closed", data.closedListener);
		//intialize the dialog itself
		data.dialogWindow.window.cloudkid.ModalDialog._init(this, dialogOptions);
	};
	
	/**
	 * Closes a dialog. The dialog will automatically call this function, you do not need to.
	 * @method close
	 * @param {nw.gui.Window} dialogWindow The Window object for the dialog.
	 * @param {*} arguments Additional arguments to pass to the callback for the dialog.
	 * @static
	 * @private
	 */
	ModalManager.close = function(dialogWindow)
	{
		var data;
		for(var i = 0; i < ModalManager._activeDialogs.length; ++i)
		{
			if(ModalManager._activeDialogs[i].dialogWindow == dialogWindow)
			{
				data = windowData[i];
				break;
			}
		}
		if(data)
		{
			var callback = data.callback;
			if(callback)
			{
				if(arguments.length > 1)
					callback.apply(data.parentWindow, Array.prototype.slice.call(arguments, 1));
				else
					callback();
			}
			cleanupDialog(data);
		}
	};
	
	/**
	* A listener for when a parent of an active dialog receives focus. This function
	* will be bound on a per-window basis.
	* @method onFocus
	* @param {nw.gui.Window} parent The parent window.
	* @static
	* @private
	*/
	function onFocus(parent)
	{
		var data;
		for(var i = 0; i < ModalManager._activeDialogs.length; ++i)
		{
			if(ModalManager._activeDialogs[i].parentWindow == parent)
			{
				data = windowData[i];
				//redirect focus
				data.dialogWindow.focus();
				break;
			}
		}
	}
	
	/**
	 * A listener for when a parent of an active dialog is closed. This function
	 * will be bound on a per-window basis.
	 * @method onClosed
	 * @param {nw.gui.Window} parent The parent window.
	 * @static
	 * @private
	 */
	function onClosed(parent)
	{
		var data;
		for(var i = 0; i < ModalManager._activeDialogs.length; ++i)
		{
			if(ModalManager._activeDialogs[i].parentWindow == parent)
			{
				data = windowData[i];
				//remove the window data
				cleanupDialog(data);
				break;
			}
		}
	}
	
	/**
	 * Closes a dialog window and cleans up the dialog.
	 * @method cleanupDialog
	 * @param {Object} data The internal data from _activeDialogs.
	 * @private
	 * @static
	 */
	function cleanupDialog(data)
	{
		var i = ModalManager._activeDialogs.indexOf(data);
		if(i < 0) return;
		
		//remove from the list
		ModalManager._activeDialogs.splice(i, 1);
		//remove the blocker
		var nodes = data.parentWindow.document.getElementsByClasName("modal-dialog-blocker");
		for(i = 0; i < nodes.length; ++i)
		{
			nodes[i].parentNode.removeChild(nodes[i]);
		}
		//clean up listeners
		data.parentWindow.removeListener("focus", data.focusListener);
		data.parentWindow.removeListener("closed", data.closedListener);
		//close the child dialog
		data.dialogWindow.close(true);
	}
	
	// Assign to namespace
	namespace('cloudkid').ModalManager = ModalManager;

}());