// show badge on browser load
var counter = 0;
if (localStorage.length > 0) {
	// count the uncompleted tasks
	for (var i = 0; i < localStorage.length - 1; i++) {
		var task = JSON.parse(localStorage['task_' + i]);
		if (task.completed != 1) counter += 1;
	}
}
chrome.browserAction.setBadgeText({ text: '' + counter + '' });
chrome.browserAction.setBadgeBackgroundColor({color: '#777' });

// add context menu for selected text
var options = JSON.parse(localStorage.options);
if (options.context_menu == '1') {
	chrome.contextMenus.create({
		title: chrome.i18n.getMessage('saveAsTask'),
		contexts: ["selection"],
		onclick: contextAddTask
	});

	// save new task from context menu
	function contextAddTask(info) {
		chrome.extension.sendMessage({addTask: info.selectionText}, function(response) {
			localStorage['task_' + (localStorage.length - 1)] = JSON.stringify({
				'text': encodeURIComponent(info.selectionText),
				'completed': 0,
				'priority': 0
			});

			var isChrome = false;
			if (
				(navigator.userAgent.match(/Chrome/i)) &&
				!(navigator.userAgent.match(/OPR/i)) &&
				!(navigator.userAgent.match(/YaBrowser/i))
			) isChrome = true;

			function syncData() {
				var json = {};
				json.syncData = JSON.parse(JSON.stringify(localStorage));
				chrome.storage.sync.set(json);
			}
			if (isChrome) syncData();

			chrome.browserAction.setBadgeText({ text: '' + localStorage.length - 1 + '' });
		});
	}
}