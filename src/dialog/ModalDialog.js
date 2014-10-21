(function(undefined){
	
	/**
	*  A class to represent a modal dialog instance. Subclass ModalDialog in order to use it.
	*  Use the ModalManager to create dialogs. They will not function if you create them yourself.
	*  @class ModalDialog
	*  @namespace cloudkid
	*  @constructor
	*  @param {Object} options Dialog options, specific to the type of dialog.
	*/
	var ModalDialog = function(options)
	{
		//Subclass constructor should set stuff up
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
		_win.addListener("closed", onClosed);
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
		_manager.close([_win].concat(arguments));
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