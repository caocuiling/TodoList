/**
background.js 文件设置浏览器加载时
*/
// 浏览器加载时显示图标
var counter = 0;
if (localStorage.length > 0) {
	// 计算未完成的任务（通过counter变量计数）
	for (var i = 0; i < localStorage.length - 1; i++) {
		var task = JSON.parse(localStorage['task_' + i]);
		if (task.completed != 1) counter += 1;
	}
}
chrome.browserAction.setBadgeText({ text: '' + counter + '' });//设置图标上的数字
chrome.browserAction.setBadgeBackgroundColor({color: '#777' });//未完成任务数字的背景

// 为选中的文本添加上下文菜单
var options = JSON.parse(localStorage.options);
if (options.context_menu == '1') {
	chrome.contextMenus.create({
		title: chrome.i18n.getMessage('saveAsTask'),
		contexts: ["selection"],
		onclick: contextAddTask
	});

	// 保存新任务的上下文菜单
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
				var j = {};
				j.syncData = JSON.parse(JSON.stringify(localStorage));
				chrome.storage.sync.set(json);
			}
			if (isChrome) syncData();

			chrome.browserAction.setBadgeText({ text: '' + localStorage.length - 1 + '' });
		});
	}
}