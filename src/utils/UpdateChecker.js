(function(undefined){
	
	/**
	*  Utility to check whether an update is available for the app. For this to work
	*  the package.json must contain a respository.url property and the GitHub account
	*  must uses Semantic Versioning and tagged releases.
	*  @class UpdateChecker
	*  @namespace cloudkid
	*  @constructor
	*  @param {Number} [remindHours=2] Numer of hours until check for another update
	*/
	var UpdateChecker = function(remindHours)
	{
		if (window.$ === undefined)
		{
			throw "jQuery must be included to use cloudkid.UpdateChecker";
		}

		// The number of seconds until we can try another update
		// this remove the nag-factor when opening the app every time
		remindHours = remindHours || 2; 

		// The last time that we checked for updates
		var lastUpdateCheck = localStorage.getItem('lastUpdateCheck') || 0;

		// Check against the last time we updates
		// reminderSec need to be converted to milliseconds to compare to now()
		if (Date.now() - lastUpdateCheck <= remindHours * 1000 * 3600)
		{
			if (DEBUG)
			{
				console.log("Ignore update until the blocker has expired");
			}
			return;
		}

		if (DEBUG)
		{
			console.log("Checking for updates...");
		}

		/**
		*  The repository URL
		*  @property {string} repository
		*/
		this.repository = null;

		/**
		*  The current tag
		*  @property {string} currentTag
		*/
		this.currentTag = null;

		/**
		*  Add a destroyed check
		*  @property {boolean} _destroyed
		*  @default
		*/
		this._destroyed = false;

		// The name of the package file
		var packagePath = "package.json";
		var self = this;

		// Load the package json file
		$.getJSON(packagePath, function(data){

			if (self._destroyed) return;

			if (!data.repository || data.repository.url.search(/github\.com/) === -1)
			{
				if (DEBUG)
				{
					console.debug("No repository set in the package.json or " +
						"repository url not supported (only GitHub), unable " + 
						"to check for updates.");
				}
				return;
			}

			self.currentTag = data.version;
			self.repository = data.repository.url;

			// Format the repository url to get the tags
			var url = data.repository.url
				.replace('http:', 'https:')
				.replace('github.com', 'api.github.com/repos') + "/releases";
				
			// Load the tags json from the github api
			$.getJSON(url, self.onTagsLoaded);
		});

		// Bind functions
		this.onTagsLoaded = this.onTagsLoaded.bind(this);
	};

	// The prototype reference
	var p = UpdateChecker.prototype;

	/**
	*  Handler for loading the releases JSON from the github API
	*  @method onTagsLoaded
	*  @param {array} releases The list of releases
	*/
	p.onTagsLoaded = function(releases)
	{
		if (this._destroyed) return;

		localStorage.setItem('lastUpdateCheck', Date.now());

		if (!releases || !Array.isArray(releases) || releases.length === 0)
		{
			if (DEBUG)
			{
				console.debug("No releases found for this project, no update-check.");
			}
			return;
		}

		var semver = require('semver');
		var i, len = releases.length, release, tag;

		for(i = 0; i < len; i++)
		{
			release = releases[i];
			tag = release.tag_name;

			// Exclude pre-releases
			if (!release.prerelease && 
				semver.valid(tag) && 
				semver.gt(tag, this.currentTag))
			{
				if (confirm("An update is available. Download now?"))
				{
					if (APP)
					{
						// Load native UI library.
						var gui = require('nw.gui');

						// Open URL with default browser.
						gui.Shell.openExternal(this.repository + '/releases/tag/' + tag);
					}
					if (WEB)
					{
						window.open(this.repository + '/releases/tag/' + tag);
					}
				}
				return;
			}
		}

		if (DEBUG)
		{
			console.log("No updates");
		}
	};

	/**
	*  Don't use after this
	*  @method destroy
	*/
	p.destroy = function()
	{
		this._destroyed = true;
	};

	// Assign to window
	namespace('cloudkid').UpdateChecker = UpdateChecker;

}());