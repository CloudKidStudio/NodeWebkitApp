(function(undefined){

	/**
	*  Create the file browser
	*  @class Browser
	*  @namespace cloudkid
	*/
	var Browser = function()
	{
		instance = this;

		if (window.$ === undefined)
		{
			throw "jQuery must be included to use cloudkid.Browser";
		}

		// Add the hidden input for browsing files
		this.file = $('<input type="file" />')
			.css('visibility', 'hidden')
			.change(function(e) {
				var input = $(this);
				input.removeAttr('accept');
				var file = input.val();
				var callback = instance._fileCallback;
				instance._fileCallback = null;
				input.val('');
				callback(file);
			});

		// Add the hidden input for browsing files
		this.saveAs = $('<input type="file" nwsaveas />')
			.css('visibility', 'hidden')
			.change(function(e) {
				var input = $(this);
				input.attr('nwsaveas', '');
				var file = input.val();
				var callback = instance._fileCallback;
				instance._fileCallback = null;
				input.val('');
				callback(file);
			});


		// Add the hidden input for browsing folders
		var param = APP ? 'nwdirectory' : 'webkitdirectory';
		this.folder = $('<input type="file" '+param+' />')
			.css('visibility', 'hidden')
			.change(function(e){
				var input = $(this);
				var folder = input.val();
				var callback = instance._folderCallback;
				instance._folderCallback = null;
				input.val('');
				callback(folder);
			});

		// Add to the body
		$('body').append(
			this.file, 
			this.folder,
			this.saveAs
		);

		// The callback functions
		this._fileCallback = null;
		this._folderCallback = null;
	};

	var p = Browser.prototype = {};

	/**
	*  Singleton instance of the browser
	*/
	var instance;

	/**
	*  Create a new version of the Browser
	*  @method  init
	*  @static
	*  @return {cloudkid.Browser} Instnace of the file browser
	*/
	Browser.init = function()
	{
		if (instance) 
		{
			throw "Only once instance file created at once";
		}
		return new Browser();
	};

	/**
	*  Get the single instance
	*  @property {cc.Browser} instance
	*/
	Object.defineProperty(Browser, "instance", 
		{
			get : function()
			{ 
				return instance; 
			}
		}
	);

	/**
	*  Browse for a folder
	*  @method  folder
	*  @static
	*  @param  {Function} callback The function to call when we selected a folder
	*/
	Browser.folder = function(callback, workingDir)
	{
		if (!instance)
		{
			throw "Call cloudkid.Browser.init() first";
		}
		instance.folder.removeAttr('nwworkingdir');
		if (APP && workingDir)
		{
			instance.folder.attr('nwworkingdir', workingDir);
		}
		instance._folderCallback = callback;
		instance.folder.trigger('click');
	};

	/**
	*  Browse for a file
	*  @method  file
	*  @static
	*  @param  {Function} callback The function to call when we selected a file
	*  @param  {string}   [types]    The file types e.g., ".doc,.docx,.xml"
	*  @param {string}	[workingDir] The current working directory
	*/
	Browser.file = function(callback, types, workingDir)
	{
		if (!instance)
		{
			throw "Call cloudkid.Browser.init() first";
		}
		instance.file.removeAttr('accept');
		if (types)
		{
			instance.file.attr('accept', types);
		}
		if (APP && workingDir)
		{
			instance.file.attr('nwworkingdir', workingDir);
		}
		instance._fileCallback = callback;
		instance.file.trigger('click');
	};

	/**
	*  Save file as
	*  @method  saveAs
	*  @static
	*  @param  {Function} callback The function to call when we selected a file
	*  @param  {string}   [types]    The file types e.g., ".doc,.docx,.xml"
	*  @param {string}	[workingDir] The current working directory
	*/
	Browser.saveAs = function(callback, filename, workingDir)
	{
		if (!instance)
		{
			throw "Call cloudkid.Browser.init() first";
		}
		instance.saveAs.attr('nwsaveas', filename || "");
		if (APP && workingDir)
		{
			instance.saveAs.attr('nwworkingdir', workingDir);
		}
		instance._fileCallback = callback;
		instance.saveAs.trigger('click');
	};

	/**
	*  Remove the singleton
	*  @method destroy
	*/
	Browser.destroy = function()
	{
		if (instance)
		{
			instance.destroy();
		}
	};

	/**
	 * Destroy and don't use after this
	 * @method destroy
	 */
	p.destroy = function()
	{
		this.file.off('change').remove();
		this.folder.off('change').remove();
		this.saveAs.off('change').remove();
		this.file = null;
		this.folder = null;
		this.saveAs = null;
		instance = null;
	};

	// Assign to namespace
	namespace('cloudkid').Browser = Browser;

}());