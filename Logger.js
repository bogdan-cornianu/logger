var Logger = (function () {
    'use strict';

	var initialWindowErrorHandler = window.onerror,
		alertFallback = true;
	
    if (typeof console === "undefined" || typeof console.log === "undefined") {
		console = {};
		if (alertFallback) {
			console.log = function(msg) {
				alert(msg);
			};
		} else {
			console.log = function() {};
		}
   }
	
	return {
        level: {
            Error: 'ERROR',
            Warning: 'WARN',
            Information: 'INFO',
            All: 'ALL'
        },

        location: {
            Console: 0,
            LocalStorage: 1,
            All: 2
        },
		
		onError: function(exportLog, suppressErrorAlerts, errorCallback) {
            var me = this,
                errorMessage = '';

            if (typeof errorCallback !== 'undefined') {
                window.onerror = errorCallback;
            } else if (exportLog && typeof errorCallback === 'undefined') {
                window.onerror = function (errorMsg, url, lineNumber) {
                    errorMessage = errorMsg + ' at line: ' + lineNumber + ' in ' + url;
                    me.log(me.level.Error, errorMessage, me.location.All);
                    me.exportLog();
					return suppressErrorAlerts;
                }
            } else {
                me.resetWindowErrorHandler();
            }
        },
		
		resetWindowErrorHandler: function() {
			window.onerror = initialWindowErrorHandler;
		},
		
		log: function(level, message, logLocation) {
			var me = this,
				eventDate = Date.now() + '_' + level,
                eventData = '[' + me.getEventDate(eventDate) + '] [' + level + ']>';
				
			switch(logLocation) {
				case me.location.Console: console.log(eventData, message); break;
				case me.location.LocalStorage: localStorage.setItem(eventDate, message); break;
				case me.location.All: console.log(eventData, message); localStorage.setItem(eventDate, message); break;
				default: console.log("Can't write to the specified location.");
			}
		},
		
		error: function (message, logLocation) {
			this.log(this.level.Error, message, logLocation);
		},
		
		warn: function (message, logLocation) {
			this.log(this.level.Warning, message, logLocation);
		},
		
		info: function (message, logLocation) {
			this.log(this.level.Information, message, logLocation);
		},
		
		getEventDate: function(eventData) {
			return (new Date(parseFloat(eventData.substring(0, eventData.indexOf('_')))));
		},
		
		getEventLevel: function(eventData) {
			return eventData.substring(eventData.indexOf('_') + 1);
		},
		
		deleteLogEvent: function(eventName) {
			localStorage.removeItem(eventName.toLowerCase());
		},
		
		getEvents: function(requestedLevel) {
			var me = this,
				eventData = null,
                eventLevel = null,
				eventText = null,
				eventMessage = null,
				loggedEvents = [];
			
			for (var i = 0; i < localStorage.length; i++)  {
				eventData = me.getEventDate(localStorage.key(i));
				eventText = localStorage.getItem(localStorage.key(i));
				eventLevel = me.getEventLevel(localStorage.key(i));
				eventMessage = '[' + eventData + '] [' + eventLevel + ']> ' + eventText + '\n';
				
				if (requestedLevel === me.level.All || me.getEventLevel(localStorage.key(i)) === requestedLevel) {
					loggedEvents.push(eventMessage);
				}
				
				if (eventLevel === requestedLevel) {
					loggedEvents.push(eventMessage);
				}
			}
			return loggedEvents.join('');
		},
		
		exportLog: function() {
			var me = this,
                currentDate = new Date(),
                currentTime = currentDate.toLocaleTimeString(),
                fileName = currentDate.toLocaleDateString() + ' ' + currentTime + '.log';

            me.saveToDisk(me.getEvents(me.level.All), fileName);
		},

        saveToDisk: function(content, filename) {
            var a = document.createElement('a'),
                blob = new Blob([content], {'type' : 'application/octet-stream'});

            a.href = window.URL.createObjectURL(blob);
            a.download = filename;
            a.click();
        }
    }
}());