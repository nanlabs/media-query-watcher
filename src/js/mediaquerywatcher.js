var $ = require('jquery'), CSSRuleRegex = /^([^:]+):(.+)/;

//IE polyfill
require('./lib/matchMedia');
require('./lib/matchMedia.addListener');

/**
 * Uses the settings.errorLogger to find the errorLogger if it was defined.
 * The logger will be used to report errors on invalid items.
 * If no logger is found, errors wont be reported.
 */
function setErrorLogger() {
  if(!this.settings.errorLogger) { return; }

  var logger;

  if(Util.isString(this.settings.errorLogger)) {
    logger = Util.getDeepValue(this.settings.errorLogger);
  } else {
    logger = this.settings.errorLogger;
  }

  this._errorLogger = logger;

  console.info((this._errorLogger)?
      "Error logger is defined. It will be used to log invalid items.":
      "No error logger found. Errors wont be logged");
}

function obtainCSSValues(selector, CSS) {
  var pattern = new RegExp(selector.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "\\s*{(\\s*[^}]+)}");
  return CSS.match(pattern)[1];
}

//gets css rule object
//@param: String
//ie: {"width" : "100px"}
function getCSSRule(rule) {
  var CSSrule = {},
  data = CSSRuleRegex.exec(rule);
  CSSrule.property = data [1];
  CSSrule.value = data [2];
  return CSSrule;
}

//return all selector css values for a media query rule in a key/value format.
function obtainCSSValuesFromRule(cssRules) {
  var rules = {};
  $.each(cssRules, function(i, rule) {
    var values = obtainCSSValues(rule.selectorText, rule.cssText).split(';');
    
    $.each(rule.selectorText.replace(/,\s+/g,',').split(','), function(i, selector) {
      rules[selector] = [];
      $.each(values, function(i, value) {
        if (CSSRuleRegex.test(value) === true) {
          rules[selector].push(getCSSRule(value));
        }
      });
    });
          
  });
  return rules;
}

/**
 * Class constructor
 */
function MediaQueryWatcher () {
  this.mediaQueriesRules = {};
}

//return all selector css values for a media query rule in a key/value format.
function obtainCSS(rule) {
  var rules = {};
    var values = obtainCSSValues(rule.selectorText, rule.cssText).split(';');
    rules[rule.selectorText] = [];
    $.each(values, function(i, value) {
      if (CSSRuleRegex.test(value) === true) {
        rules[rule.selectorText].push(getCSSRule(value));
      }
    });
  return rules;
}

/**
 * Media Query Watcher Class contents
 */
MediaQueryWatcher.prototype = {

 addMediaQueriesListener : function (styleSheet, mediaChangeHandler) {
    var rules, actualAppliedRules = ["noMediaRule"], mql;
    if (styleSheet) {
      rules = styleSheet.cssRules;
      for (var j = 0; j < rules.length; j += 1) {
        if (rules[j].constructor === window.CSSMediaRule) {
            this.mediaQueriesRules[rules[j].media.mediaText] = this.mediaQueriesRules[rules[j].media.mediaText] || {};
            $.extend(this.mediaQueriesRules[rules[j].media.mediaText], obtainCSSValuesFromRule(rules[j].cssRules));
            mql = window.matchMedia(rules[j].media.mediaText);
            if (mql.matches === true) {
              actualAppliedRules.push(rules[j].media.mediaText); 
            }
            mql.addListener(mediaChangeHandler);
        } else if (rules[j].constructor === window.CSSStyleRule) {
            this.mediaQueriesRules["noMediaRule"] = this.mediaQueriesRules["noMediaRule"] || {};
            $.extend(this.mediaQueriesRules["noMediaRule"], obtainCSSValuesFromRule([rules[j]]));
        }
      }
    }
    
    return actualAppliedRules;
  },

  //gets the target CSS properties from a @mediaData for the indicated selectors in descending priority order.
  getMediaQueryProperties : function (mediaData, selectors, targetProperties) {
    var propertiesObject = {}, itemsRemoved = 0;

    if (typeof(mediaData) !== 'undefined') {
      $.each(selectors, function (index, selector) {
        var property, propertyPosition;
        if (typeof(mediaData[selector]) !== 'undefined') {
          $.each(mediaData[selector], function(i, val) {
            property = val.property.split(" ").join("");
            propertyPosition = targetProperties.indexOf(property);
            if (propertyPosition !== -1) {
              propertiesObject[property] = val.value.split(" ").join("");
              targetProperties.splice(propertyPosition - itemsRemoved, 1);
              itemsRemoved += 1;
            }
          });
        }
        if (targetProperties.length === 0) {
          return false;
        }
      });
    }

    return propertiesObject;
  }

};

// Exports the class
module.exports = MediaQueryWatcher;