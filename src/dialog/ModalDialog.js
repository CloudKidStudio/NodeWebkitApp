(function(undefined){
	
	/**
	*  A class to represent a modal dialog instance. Subclass ModalDialog in order to use it.
	*  Use the ModalManager to create dialogs. They will not function if you create them yourself.
	*  Your dialog HTML file needs to load the CloudKid Namespace library, ModalDialog.js, and the
	*  file for your subclass of ModalDialog, like SimpleDialog.js.
	*
	*  @class ModalDialog
	*  @namespace cloudkid
	*  @constructor
	*  @param {Object} options Dialog options, specific to the type of dialog.
	*/
	var ModalDialog = function(options)
	{
		//Subclass constructor should set stuff up
		
		/**
		* The window for this dialog. This reference is provided in case
		* your dialog needs to open another dialog. It is set after the
		* constructor has completed.
		*
		* @property {nw.gui.Window} _win
		* @private
		* @readOnly
		*/
		this._win = null;
		
		/**
		* The dialog manager for the application. This reference is provided in case
		* your dialog needs to open another dialog. It is set after the
		* constructor has completed.
		*
		* @property {cloudkid.ModalManager} _manager
		* @private
		* @readOnly
		*/
		this._manager = null;
	};
	
	var p = ModalDialog.prototype = {};
	
	var _instance,
		_manager,
		_win;
	
	/**
	 * Destroys the dialog. Override this to perform any cleanup
	 * that you need to do when the dialog is closed.
	 * @method destroy
	 */
	p.destroy = function()
	{
		this._manager = this._win = null;
	};
	
	/**
	* Creates the dialog. This function is called by the ModalManager.
	* @method _init
	* @param {cloudkid.ModalManager} manager The ModalManager that created this dialog.
	* @param {nw.gui.Window} win The Node WebKit Window for this dialog.
	* @param {Object} options The dialog options for this dialog.
	* @static
	* @private
	*/
	ModalDialog._init = function(manager, win, options)
	{
		_manager = manager;
		_win = win;
		var DialogConstructor = namespace(options.dialogClass);
		_instance = new DialogConstructor(options);
		_instance._manager = _manager;
		_instance._win = _win;
		_win.addListener("closed", onClosed);
		//ensure that the window is closed
		_win.show();
	};
	
	/**
	 * Listener for if the window is closed outside of using the dialog buttons.
	 * @method onClosed
	 */
	function onClosed()
	{
		//cancel dialog with no data
		ModalDialog.close();
	}
	
	/**
	* Closes the dialog. Call this and pass any data about the dialog in order to close it.
	* @method close
	* @param {*} arguments Additional arguments to pass to the callback for the dialog.
	* @static
	*/
	ModalDialog.close = function()
	{
		_manager.close.apply(_manager, [_win].concat(Array.prototype.slice.call(arguments)));
	};
	
	/**
	* Cleans up static data and calls destroy() on the dialog instance.
	* This function is automatically called by the ModalManager.
	* @method _cleanup
	* @static
	* @private
	*/
	ModalDialog._cleanup = function()
	{
		_instance.destroy();
		_win.removeListener("closed", onClosed);
		_instance = _win = _manager = null;
	};
	
	// Assign to namespace
	namespace('cloudkid').ModalDialog = ModalDialog;

}());