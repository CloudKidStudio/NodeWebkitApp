(function(undefined){
	
	/**
	*  A simple dialog class for dialogs with a message and an arbitrary number of buttons.
	*  In the HTML page, an element with the id of "dialogMessage" contains the message text,
	*  and an element with the id of "dialogButtons" contains the Button elements that are made.
	*  The dialog callback for SimpleDialog will be passed the text of the selected button. If
	*  the dialog window was closed without choosing a button, then nothing will be passed to
	*  the dialog callback.
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
		cloudkid.ModalDialog.call(this);
		
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
		//close dialog and send the button text to the callback
		cloudkid.ModalDialog.close(buttonText);
	};
	
	p.destroy = function()
	{
		cloudkid.ModalDialog.prototype.destroy.call(this);
		
		//remove event listeners
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