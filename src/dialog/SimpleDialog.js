(function(undefined){
	
	/**
	*
	*  @class SimpleDialog
	*  @namespace cloudkid
	*  @constructor
	*  @param {Object} options Dialog options, specific to the type of dialog.
	*  @param {String} options.message Message to display in the dialog.
	*  @param {Array} options.buttons String text to display on the buttons. When a button
	*                                 is clicked, the dialog closes and the button text of the
	*                                 clicked button is passed to the callback.
	*/
	var SimpleDialog = function(options)
	{
		document.getElementById("dialogMessage").innerHTML = options.message;
		var buttonParent = document.getElementById("dialogButtons");
		this.buttonListeners = [];
		for(var i = 0; i < options.buttons.length; ++i)
		{
			var button = document.createElement("button");
			button.innerHTML = options.buttons[i];
			var listener = this.buttonListeners[i] = this.onButton.bind(this, options.buttons[i]);
			button.addEventListener("click", listener);
			buttonParent.appendChild(button);
		}
	};
	
	var p = SimpleDialog.prototype = Object.create(cloudkid.ModalDialog.prototype);
	
	p.onButton = function(buttonText)
	{
		cloudkid.ModalDialog.close(buttonText);
	};
	
	p.destroy = function()
	{
		var buttons = document.getElementsByTagName("button");
		for(var i = 0; i < buttons.length; ++i)
		{
			buttons[i].removeEventListener("click", this.buttonListeners[i]);
		}
		this.buttonListeners = null;
	};
	
	// Assign to namespace
	namespace('cloudkid').SimpleDialog = SimpleDialog;

}());