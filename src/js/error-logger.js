var Util = require('./util');

 /**
 * The path (namespace and var name) where the error logger single instance is added.
 */
var DEFAULT_PATH = 'xteam.error.logger';


/**
 * Class constructor
 */
function ErrorLogger () {
  this.init();
}

/**
 * ErrorLogger Class contents
 */
ErrorLogger.prototype = {
  init: function() {
		this.clear();
	},

  /**
   * Adds a new error to the logger
   */
	addError: function(componentId, code, description, data) {
		var item = {
			componentId: componentId,
			code: code,
			description: description || '',
			data: data || {}
		};

		if(this._validateErrorItem(item)) {
			this.errors.push(item);
		}
	},

  /**
   * Adds multiple errors in one call for the same component
   */
	addErrors: function(componentId, errors) {
		if(!errors) { return; }
		for(var i = 0; i < errors.length; i++) {
			var error = errors[i];
			this.addError(componentId, error.code, error.description, error.data);
		}
	},

  /**
   * Display the errors in the console
   */
	show: function() {
    if(!this.hasErrors()) {
      console.debug("No errors were logged so far");
      return;
    }

		for(var i = 0; i < this.errors.length; i++) {
			console.error(JSON.stringify(this.errors[i]));
		}
	},

  /**
   * Clear the errors.
   */
	clear: function() {
		this.errors = [];
	},

  /**
   * @returns true if the logger contains errors. false otherwise.
   */
  hasErrors: function() {
    return (this.errors.length > 0);
  },

  /**
  * Validates the error. If any required field is missing, the error is not added.
  * @returns the validation problems for the error.
  */
  _validateErrorItem: function (errorItem) {
    if(Util.isEmpty(errorItem.componentId) || Util.isEmpty(errorItem.code)) {
      this.addError('ErrorLogger', 'missing_required_field', 'The error field does not contain a componentId and/or an error code', { originalError: errorItem });
      return false;
    }
    return true;
  }
};

/**
 * Create the single instance of ErrorLogger that will be used in the application.
 */
function initialize () {
  var result = Util.createDeepVariable(DEFAULT_PATH);
  result.parent[result.item] = new ErrorLogger();
}

initialize();
module.exports = ErrorLogger;
