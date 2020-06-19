local guiBrowser = false;
-- Edytowany skrypt musi być uruchomiony, aby można było edytować jego pliki - ograniczenie MTA.
	-- zakodować html na końcu i zrobić każdorazowe odkodowywanie


function showEditor()
	showCursor(true);
	guiSetInputEnabled(true);
	if (guiBrowser) then
		guiSetVisible(guiBrowser, true);
		return;
	end
	guiBrowser = guiCreateBrowser(0, 0, 1, 1, true, true, true)
	local browser = guiGetBrowser(guiBrowser);

	addEventHandler('onClientBrowserCreated', browser, function()
		loadBrowserURL(source, "http://mta/local/html/index.html") 
	end)
end

function hideEditor(destroy)
	showCursor(false);
	guiSetInputEnabled(false);
	if (not destroy) then
		guiSetVisible(guiBrowser, false);
		return;
	end
	destroyElement(guiBrowser);
	guiBrowser = false;
end

addCommandHandler('edit-on', showEditor);
addCommandHandler('edit-forceoff', hideEditor);
addCommandHandler('edit-off', function() hideEditor(false) end);
--przyciski: czerwony forceoff, zolty off, zielony fullscreen (ale nie jest napisany jeszcze)
-- przyciski do zapisywania oraz przechodzenia do listy skryptów może jakoś inaczej się uda zrobić
-- przy przejściu do listy skryptów nie wczytywać ich od nowa - dodać jakiś malutki przycisk w rogu do odświeżania


addEvent('insertScriptsList', true);
addEventHandler('insertScriptsList', resourceRoot, function(scriptsList)
	if (not scriptsList) then return end;
	local b = guiGetBrowser(guiBrowser);
	executeBrowserJavascript(b, "desctext.innerHTML = '<span>Wybierz skrypt z listy, który chcesz edytować.<br>Znaleziono "..#scriptsList.." skryptów.</span>';");
	executeBrowserJavascript(b, 'resetSelectValues()');
	for _, script in pairs(scriptsList) do
		executeBrowserJavascript(b, 'addSelectValue('..inspect(script.path)..', '..inspect(script.name)..')');
	end
	executeBrowserJavascript(b, [[
		iziToast.success({
			title: 'OK',
			message: 'Pomyślnie pobrano listę skryptów!',
		});
	]]);
	executeBrowserJavascript(b, 'setScriptsListVisible(true)');
end)



addEvent('switchToScriptsList', true)
addEventHandler('switchToScriptsList', resourceRoot, function()
	triggerServerEvent('getScriptsList', resourceRoot);
end)


addEvent('getFilenamesFromResource-c', true)
addEventHandler('getFilenamesFromResource-c', resourceRoot, function(resourceName, filesTable, resourceRunning)
	local b = guiGetBrowser(guiBrowser);
	if (not filesTable or #filesTable < 1) then
		executeBrowserJavascript(b, [[
			iziToast.error({
				title: 'Błąd',
				message: 'Nie znaleziono żadnych plików w skrypcie, lub jest on wyłączony.',
			});
		]]);
		return;
	end
	local files = table.concat(filesTable, '|');
	executeBrowserJavascript(b, 'askForFilename('..inspect(resourceName)..', "'..files..'", '..inspect(resourceRunning)..')');
end)

addEvent('getFilenamesFromResource-js', true)
addEventHandler('getFilenamesFromResource-js', resourceRoot, function(resourceName)
	if (not resourceName) then
		return triggerEvent('getFilenamesFromResource-c', resourceRoot, false, false);
	end
	triggerServerEvent('getFilenamesFromResource-s', resourceRoot, resourceName);
end)
-----------
addEvent('getFileContent-c', true)
addEventHandler('getFileContent-c', resourceRoot, function(content, filetype, filename, path)
	local b = guiGetBrowser(guiBrowser);
	if (not content) then
		executeBrowserJavascript(b, [[
			iziToast.error({
				title: 'Błąd',
				message: 'Wystąpił niezidentyfikowany błąd - nie można pobrać treści pliku.',
			});
		]]);
		return;
	end
	executeBrowserJavascript(b, 'setCodeToEdit('..inspect(content)..', '..inspect(filetype)..', '..inspect(filename)..', '..inspect(path)..')');
	executeBrowserJavascript(b, 'setScriptsListVisible(false)');
	executeBrowserJavascript(b, 'aeditor.focus(); aeditor.navigateFileEnd();');
end)

addEvent('getFileContent-js', true)
addEventHandler('getFileContent-js', resourceRoot, function(path)
	if (not path) then return end
	triggerServerEvent('getFileContent-s', resourceRoot, path);
end)


addEvent('saveScript', true)
addEventHandler('saveScript', resourceRoot, function(path, resourceData)
	if (not path or not resourceData) then
		return
	end
	triggerServerEvent('saveScript-s', resourceRoot, path, resourceData);
end)

addEvent('saveScript-c', true)
addEventHandler('saveScript-c', resourceRoot, function(path, resourceData)
	executeBrowserJavascript(guiGetBrowser(guiBrowser), 'askForRestart()');
end)

addEvent('createNotification', true);
addEventHandler('createNotification', resourceRoot, function(type, title, text, timeout)
	if (not type or not text) then
		return
	end
	if (not title) then
		title = type;
	end
	local b = guiGetBrowser(guiBrowser);
	executeBrowserJavascript(b, "iziToast."..type.."({id: 'success', zindex: 9999, timeout: "..(timeout or 3000)..", title: "..inspect(title)..", overlay: true, message: "..inspect(text)..", position: 'center'});")

end)

addEvent('restartResource-c', true)
addEventHandler('restartResource-c', resourceRoot, function(resourceName)
	if (not resourceName) then
		return
	end
	triggerServerEvent('restartResource-s', resourceRoot, resourceName);
end)

---------------------------------------------------------------------
local devtools = false;
bindKey('F10', 'down', function(_, state)
	setDevelopmentMode(true, true);
	if (devtools) then
		toggleBrowserDevTools(guiGetBrowser(guiBrowser), false);
		devtools = false;
	else
		toggleBrowserDevTools(guiGetBrowser(guiBrowser), true);
		devtools = true;
	end
end)

addCommandHandler('xt', function()
	triggerServerEvent('getScriptsList', resourceRoot);
end)