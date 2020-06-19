addEvent('getScriptsList', true);
addEventHandler('getScriptsList', resourceRoot, function()
    local r = getResources();
    local resources = {};
    for _, resource in pairs(r) do
        table.insert(resources, {name = getResourceName(resource), path = getResourceOrganizationalPath(resource)});
        -- w htmlu zrobic path takim malym szarym, a name juz normalnie duzymi bialymi
    end
--    print(inspect(resources));
    triggerClientEvent(client, 'insertScriptsList', resourceRoot, resources)
end)

local ignoreThis = {
	['png'] = true,
	['jpg'] = true,
	['mp4'] = true,
	['txd'] = true,
	['dff'] = true,
	['ttf'] = true,
	['otf'] = true
}

addEvent('getFilenamesFromResource-s', true);
addEventHandler('getFilenamesFromResource-s', resourceRoot, function(resourceName)
	outputConsole('wykonanie s')
	local meta = xmlLoadFile(':'..resourceName..'/meta.xml', true);
	local resource = getResourceFromName(resourceName);
    if (not meta or not resource) then
        triggerClientEvent(client, 'getFilenamesFromResource-c', resourceRoot, false, 'false1');
        return
	end
	local resourceRunning = getResourceState(resource) == 'running' and true or false;
    local tags = xmlNodeGetChildren(meta);
    local files = {};
    for _, tag in pairs(tags) do
        local src = xmlNodeGetAttribute(tag, 'src')
		if (src) then
			local filetype = split(src, '.');
			filetype = filetype[#filetype];
			if not (ignoreThis[filetype]) then
				table.insert(files, src);
			end
        end
    end
    if (#files == 0) then
		triggerClientEvent(client, 'getFilenamesFromResource-c', resourceRoot, false, 'false2');
        return;
    end
    triggerClientEvent(client, 'getFilenamesFromResource-c', resourceRoot, resourceName, files, resourceRunning);
end)

addEvent('getFileContent-s', true);
addEventHandler('getFileContent-s', resourceRoot, function(path)
	local file = fileOpen(path);
	if (not file) then
		triggerClientEvent(client, 'getFileContent-c', resourceRoot, false);
		return
	end
	local filesize = fileGetSize(file);
	local data = fileRead(file, filesize);
	local filetype = split(path, '.');
	filetype = filetype[#filetype];
	local filename = split(path, '/');
	filename = filename[#filename];
	triggerClientEvent(client, 'getFileContent-c', resourceRoot, data, filetype:lower(), filename, path);
	fileClose(file);
end)

addEvent('saveScript-s', true);
addEventHandler('saveScript-s', resourceRoot, function(path, resourceData)
	if (not resourceData or resourceData == '') then
		return
	end
	-- pozniejco ja robie
	outputChatBox('-------------------------')
	outputChatBox('filename '..path);
	outputChatBox('res data '..resourceData:len());


	local file = fileOpen(path);
	if (not file) then
		triggerClientEvent(client, 'createNotification', resourceRoot, 'error', 'Błąd', 'Wystąpił błąd przy otwieraniu pliku w celu zapisu.');
		return
	end
	fileWrite(file, resourceData);
	fileClose(file);
	triggerClientEvent(client, 'createNotification', resourceRoot, 'success', 'Sukces', 'Pomyślnie zapisano plik.');
end)