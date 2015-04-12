(function($) {
$(function() {

	if (!localStorage.options) localStorage.options = '{}';

	$('ul').dragsort({ dragSelector: 'div.drag', dragSelectorExclude: 'div.task, textarea.editable, div.menu', dragEnd: function() {
		$('li').each(function(index) {
			update(index, $(this).find('textarea.editable').val(), ( $(this).is('.completed') ) ? 1 : 0, $(this).data('priority'));
		});
		outputTasks();
	}, placeHolderTemplate: '<li class="placeholder"></li>' });

	$('#options').click(function() {
		chrome.tabs.create({'url': 'options.html'});
	});

	var isChrome = false;
	if (
		(navigator.userAgent.match(/Chrome/i)) &&
		!(navigator.userAgent.match(/OPR/i)) &&
		!(navigator.userAgent.match(/YaBrowser/i))
	) isChrome = true;

	if (isChrome) {
		function getSyncData() {
			chrome.storage.sync.get('syncData', function(data) {
				localStorage.clear();
				localStorage.options = '{}';
				var storage = data.syncData;
				for (var key in storage) {
					localStorage[key] = storage[key];
				}
				outputTasks();
				badge();
			});
		}
		getSyncData();
		chrome.storage.onChanged.addListener(
			function(changes, namespace) {
				getSyncData();
			}
		);
		function syncData() {
			var json = {};
			json.syncData = $.parseJSON(JSON.stringify(localStorage));
			chrome.storage.sync.set(json);
		}
	}

	function update(index, task, completed, priority) {
		localStorage['task_' + index] = JSON.stringify({
			'text': encodeURIComponent($.trim(task)),
			'completed': ((completed) ? 1 : 0),
			'priority': ((priority) ? priority : 0)
		});
	}

	function clickableLink(text) {
		var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
		return text.replace(exp, "<a href='$1'>$1</a>");
	}

	function setOptions() {
		var options = $.parseJSON(localStorage.options);
		if (options.task_css) $('div.task').attr('style', decodeURIComponent(options.task_css));
		if (options.color1) {
			$('li.priority1 div.task').css('color', options.color1);
			$('div.pr[data-index="1"]').css('background', options.color1);
		}
		if (options.color2) {
			$('li.priority2 div.task').css('color', options.color2);
			$('div.pr[data-index="2"]').css('background', options.color2);
		}
		if (options.color3) {
			$('li.priority3 div.task').css('color', options.color3);
			$('div.pr[data-index="3"]').css('background', options.color3);
		}
	}

	function saveTask(t) {
		var li = t.closest('li');
		var index = li.data('index');
		t.hide()
			.siblings('div.save').hide()
			.siblings('div.edit').show().removeAttr('style');
		var task = t.val();
		t.val($.trim(task));
		update(index, task, ( li.is('.completed') ) ? 1 : 0, li.data('priority'));
		outputTasks();
	}

	// output tasks
	function outputTasks(newItem) {
		$('ul').empty();
		var tasks = '';
		for (var i = 0; i < localStorage.length - 1; i++) {
			var data = $.parseJSON(localStorage['task_' + i]);
			var	divTask = '',
					classCompleted = '',
					classNew = '',
					classPriority = '',
					active1 = '',
					active2 = '',
					active3 = '',
					active0 = '';
			if (data.completed == 1) classCompleted = ' class="completed"';
			if (newItem && i == localStorage.length - 2) classNew = ' class="new"';
			if (data.priority !== 0) classPriority = ' class="priority' + data.priority + '"';
			if (data.priority == 1) active1 = ' active';
			if (data.priority == 2) active2 = ' active';
			if (data.priority == 3) active3 = ' active';
			if (data.priority === 0) active0 = ' active';
			var task = decodeURIComponent(data.text);
			divTask = task.replace(/\n/g, '<br>');
			divTask = clickableLink(divTask);
			tasks +='<li data-index="' + i + '" data-priority="' + data.priority + '"' + classCompleted + classNew + classPriority + '>' +
								'<div class="task">' + divTask + '</div>' +
								'<textarea class="editable">' + task + '</textarea>' +
								'<div class="checkbox"></div>' +
								'<div class="edit" title="编辑"></div>' +
								'<div class="action"></div>' +
								'<div class="drag"></div>' +
								'<div class="menu">' +
									'<div class="priority">优先级:</div>' +
									'<div class="pr' + active1 + '" data-index="1">1</div>' +
									'<div class="pr' + active2 + '" data-index="2">2</div>' +
									'<div class="pr' + active3 + '" data-index="3">3</div>' +
									'<div class="pr' + active0 + '" data-index="0">0</div>' +
									'<div class="delete">删除</div>' +
								'</div>' +
								'<div class="save" title="保存"></div>' +
							'</li>';
		}
		$('ul').append(tasks);
		$('li.completed').each(function() {
			$(this).appendTo('ul');
		});

		// priority1
		var priority1 = '';
		$('li.priority1').each(function() {
			priority1 += $('<div />').append($(this).clone()).html();
			$(this).remove();
		});
		$('ul').prepend(priority1);

		// priority2
		var priority2 = '';
		$('li.priority2').each(function() {
			priority2 += $('<div />').append($(this).clone()).html();
			$(this).remove();
		});
		if ( $('li.priority1').length ) {
			$('li.priority1:last').after(priority2);
		} else {
			$('ul').prepend(priority2);
		}

		// priority3
		var priority3 = '';
		$('li.priority3').each(function() {
			priority3 += $('<div />').append($(this).clone()).html();
			$(this).remove();
		});
		if ( $('li.priority2').length ) {
			$('li.priority2:last').after(priority3);
		} else if ( $('li.priority1').length ) {
			$('li.priority1:last').after(priority3);
		} else {
			$('ul').prepend(priority3);
		}

		if ( $('li').length && $('li').length == $('li.completed').length ) {
			$('div.check-all').addClass('checked');
		}

		setOptions();
		setTimeout(function() {
			if (isChrome) syncData();
		}, 500);

		
	}

	// translation
	

	function badge() {
		chrome.browserAction.setBadgeText({ text: '' + $('li:not(.completed)').length + '' });
	}

	chrome.browserAction.setBadgeBackgroundColor({color: '#777' });
	outputTasks();
	badge();

	// mark/unmark all tasks as completed
	$('div.check-all').click(function() {
		if ( $(this).is('.checked') ) {
			$(this).removeClass('checked');
			$('li.completed').removeClass('completed');
			$('li').each(function(index) {
				update(index, $(this).find('textarea.editable').val(), 0, $(this).data('priority'));
			});
			outputTasks();
		} else {
			$(this).addClass('checked');
			$('li').each(function(index) {
				update($(this).data('index'), $(this).find('textarea.editable').val(), 1, $(this).data('priority'));
			});
			outputTasks();
		}
		badge();
	});

	// delete all completed
	$('div.del-completed').click(function() {
		var liCount = $('li').length;
		var complCount = $('li.completed').length;
		$('li.completed').addClass('remove');
		setTimeout(function() {
			$('li').each(function(index) {
				update(index, $(this).find('textarea.editable').val(), 0, $(this).data('priority'));
			});
			for (var i = complCount; i > 0; i--) {
				localStorage.removeItem('task_' + (liCount - i));
			}
			$('div.check-all').removeClass('checked');
			outputTasks();
		}, 500);
	});

	$('ul')
	// mark/unmark task as completed
	.on('click', 'div.checkbox', function() {
		$('div.check-all').removeClass('checked');
		var li = $(this).closest('li');
		var index = li.data('index');
		var task = li.find('textarea.editable').val();
		li.removeClass('new');
		if ( li.is('.completed') ) {
			li.removeClass('completed');
			update(index, task, 0, li.data('priority'));
			outputTasks();
		} else {
			li.addClass('completed').appendTo('ul');
			update(index, task, 1, li.data('priority'));
			outputTasks();
		}
		badge();
	})
	// show menu
	.on('click', 'div.action', function() {
		$(this).closest('li').siblings().find('div.menu').hide();
		var menu = $(this).siblings('div.menu');
		if ( menu.is(':visible') ) {
			menu.hide();
		} else {
			menu.show();
		}
	})
	// make task editable
	.on('click', 'div.edit', function() {
		var li = $(this).closest('li');
		li.find('div.task').hide();
		var ta = li.find('textarea.editable');
		var taVal = ta.val();
		ta.show().val('').focus().val(taVal).css('height', '16px').height(ta[0].scrollHeight - 3);
		li.find('div.save').show();
		li.find('div.menu').hide();
		li.find('div.edit, div.action').css('right', -50);
	})
	// save task on blur
	.on('blur', 'textarea.editable', function() {
		saveTask( $(this) );
	})
	// save task on 'Save' button click
	.on('click', 'div.save', function() {
		saveTask( $(this).parent().find('textarea.editable') );
	})
	// save task
	.on('keydown', 'textarea.editable', function(e) {
		var options = $.parseJSON(localStorage.options);
		if (!options.hotkeys || options.hotkeys == '0') {
			// Enter - save task
			if (e.keyCode == 13 && !e.ctrlKey && !e.shiftKey) {
				$(this).blur();
			// Ctrl + Enter - new line
			} else if (e.ctrlKey && e.keyCode == 13) {
				$(this).val(function(i, val){
					return val + '\n';
				});
			}
		} else if (options.hotkeys == '1') {
			// Ctrl + Enter - save task (Enter - new line)
			if (e.ctrlKey && e.keyCode == 13) {
				$(this).blur();
			}
		}
	})
	// textarea auto resize
	.on('keyup', 'textarea.editable', function(e) {
		$(this).height(0);
		$(this).height(this.scrollHeight - 3);
	})
	// delete task
	.on('click', 'div.delete', function() {
		$(this).closest('li').remove();
		localStorage.removeItem('task_' + $('li').length);
		$('li').each(function(index) {
			update(index, $(this).find('textarea.editable').val(), ( $(this).is('.completed') ) ? 1 : 0, $(this).data('priority'));
		});
		badge();
		outputTasks();
	})
	// change task priority
	.on('click', 'div.pr', function() {
		$(this).addClass('active').siblings().removeClass('active');
		$(this).closest('li').data('priority', $(this).data('index'));
		$('li').each(function(index) {
			update($(this).data('index'), $(this).find('textarea.editable').val(), ( $(this).is('.completed') ) ? 1 : 0, $(this).data('priority'));
		});
		outputTasks();
	})
	// click on a link
	.on('click', 'a', function() {
		chrome.tabs.create({'url': $(this).attr('href')});
	});

	// textarea auto resize
	function textareaResize() {
		var ta = $('#new-task');
		ta.css('height', '16px');
		ta.height(ta[0].scrollHeight);
	}
	function delayedResize() {
		window.setTimeout(textareaResize, 0);
	}
	textareaResize();

	$('#new-task').focus()
	.on('cut paste drop keydown', function() {
		delayedResize();
	})
	// new task hotkeys
	.keydown(function(e) {
		var options = $.parseJSON(localStorage.options);
		if (!options.hotkeys || options.hotkeys == '0') {
			// Enter - add new task
			if (e.keyCode == 13 && !e.ctrlKey && !e.shiftKey) {
				e.preventDefault();
				$('#submit').click();
			// Ctrl + Enter - new line
			} else if (e.ctrlKey && e.keyCode == 13) {
				$(this).val(function(i, val){
					return val + '\n';
				});
			}
		} else if (options.hotkeys == '1') {
			// Ctrl + Enter - add new task (Enter - new line)
			if (e.ctrlKey && e.keyCode == 13) {
				$('#submit').click();
			}
		}
	});

	// add new task
	$('#submit').click(function() {
		var task = $('#new-task').val();
		if (task !== '') {
			update(localStorage.length - 1, task, 0, 0);
			outputTasks(newItem = 1);
			$('#new-task').val('');
			badge();
		}
	});

	$(document).on('click', function(e) {
		if (!$(e.target).is('.action')) {
			$('div.menu').hide();
		}
	});

});
})(jQuery);