const inputField = document.querySelector('.chosen-value');
const dropdown = document.querySelector('.value-list');
let dropdownArray = [... document.querySelectorAll('li')];
dropdown.classList.add('open');
inputField.focus(); // Demo purposes only
let valueArray = [];
dropdownArray.forEach(item => {
	valueArray.push(item.textContent);
});
let currentlyEditing;

const closeDropdown = () => {
	dropdown.classList.remove('open');
}

inputField.addEventListener('input', () => {
	dropdown.classList.add('open');
	let inputValue = inputField.value.toLowerCase();
	let valueSubstring;
	if (inputValue.length > 0) {
		for (let j = 0; j < valueArray.length; j++) {
			if (!(inputValue.substring(0, inputValue.length) == valueArray[j].substring(0, inputValue.length).toLowerCase())) {
				dropdownArray[j].classList.add('closed');
			} else {
				dropdownArray[j].classList.remove('closed');
			}
		}
	} else {
		for (let i = 0; i < dropdownArray.length; i++) {
			dropdownArray[i].classList.remove('closed');
		}
	}
});

function getIndexOfScriptInList(DOM_element){
		if (!DOM_element) return console.log('kurwa nie dziala1');
		for (const index in dropdownArray){
				if (dropdownArray[index] == DOM_element)
						return index;
		}
		return false;
}

function onScriptNameClick(item){
		item.addEventListener('click', (evt) => {
		 //   inputField.value = item.textContent;
				let index = false;
				for (const i in dropdownArray){
						if (dropdownArray[i] == item)
								index = i;
				}
				if (!index) return;
				const name = valueArray[index];
				inputField.value = name;
				dropdownArray.forEach(dropdown => {
					dropdown.classList.add('closed');
				});

				mta.triggerEvent('getFilenamesFromResource-js', name)
		});
}

/*dropdownArray.forEach(item => {
	item.addEventListener('click', (evt) => {
		inputField.value = item.textContent;
		dropdownArray.forEach(dropdown => {
			dropdown.classList.add('closed');
		});
		
		console.log('wybrano '+inputField.value);
	});
})*/

inputField.addEventListener('focus', () => {
	 inputField.placeholder = 'Wyszukaj';
	 dropdown.classList.add('open');
	 dropdownArray.forEach(dropdown => {
		 dropdown.classList.remove('closed');
	 });
});

inputField.addEventListener('blur', () => {
		inputField.placeholder = 'Wybierz...';
		setTimeout( () => dropdown.classList.remove('open'), 500);
});

document.addEventListener('click', (evt) => {
	const isDropdown = dropdown.contains(evt.target);
	const isInput = inputField.contains(evt.target);
	if (!isDropdown && !isInput) {
		dropdown.classList.remove('open');
	}
});


///////////

iziToast.settings({
		timeout: 10000,
		closeOnEscape: true
});

function resetSelectValues(){
		let select = document.querySelector('.value-list');
		if (!select) return;
		select.innerHTML = '';
		valueArray = [];
		dropdownArray = [];
}

function addSelectValue(path, name){
		let select = document.querySelector('.value-list');
		if (!select) return;
		let elem = document.createElement('li');
		elem.innerHTML = `<span class="small">${path}</span>${name}`;
		select.appendChild(elem);
		valueArray.push(name);
		dropdownArray.push(elem);
		onScriptNameClick(elem);
}

function setScriptsListVisible(state){
		if (state){
				edit.style.display = 'none';
				selectScript.style.display = 'block';
				inputField.focus();
				sideIcons.style.display = 'none';
		} else {
				edit.style.display = 'block';
				sideIcons.style.display = 'block';
				selectScript.style.display = 'none';
		}
}

function setCodeToEdit(code, filetype, filename, path){
		let ext;
		ext = filetype || 'lua';
		aeditor.setValue(code);
		aeditor.clearSelection();
		aeditor.getSession().setMode('ace/mode/'+ext);

		desctext.innerHTML = `
				<span>Edytowanie <b>${filename}</b></span>
				<span>Użyj kolorowych przycisków do poruszania się po interfejsie.</span>
		`;
	//	const path = originalpath.replace(':', '').split('/')[0];
		currentlyEditing = path;
}

function askForFilename(resourceName, resourceFiles, resourceRunning){
		let files = [];
		const filesArray = resourceFiles.split('|');
		for (const file of filesArray){
				if (resourceRunning)
						files.push(`<option>${file}</option>`);
				else
						files.push(`<option disabled>${file}</option>`);
		}
		iziToast.question({
			layout: 1,
			drag: false,
			timeout: false,
			close: false,
			overlay: true,
			displayMode: 1,
			id: 'question',
			progressBar: true,
			title: resourceName || 'siema',
			message: 'Wybierz plik do edycji',
			position: 'center',
			inputs: [
				[`<select>
					${files.join(' ')}
				</select>`, 'change', function (instance, toast, select, e) {
					console.info(select.options[select.selectedIndex].value);
					// console.info(select);
				}]
			],
			buttons: [
				['<button><b>Edytuj</b></button>', function (instance, toast, button, e, inputs) {
					const Filename = inputs[0].options[inputs[0].selectedIndex].value;
					if (Filename == 'Wybierz') return;

					instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');

					mta.triggerEvent('getFileContent-js', `:${resourceName}/${Filename}`);

					iziToast.success({
							zindex: 9999,
							timeout: 2000,
							title: 'Success',
							overlay: true,
							message: 'Rozpoczęto edycję pliku <b>'+Filename+'</b>.',
							position: 'center',
							closeOnClick: true,
							closeOnEscape: true,
							pauseOnHover: false,
							targetFirst: false
					});

				}, true], // true to focus
				['<button>Anuluj</button>', function (instance, toast, button, e) {
					instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
				}]
			],
			onClosing: function(instance, toast, closedBy){
				// console.info('Closing | closedBy: ' + closedBy);
			},
			onClosed: function(instance, toast, closedBy){
				// console.info('Closed | closedBy: ' + closedBy);
			}
		});
		if (!resourceRunning){
			iziToast.warning({
				zindex: 9999,
				timeout: 30000,
				title: 'Uwaga',
				overlay: true,
				closeOnEscape: true,
				message: 'Zasób jest wyłączony - nie da się zobaczyć treści plików.<br>Włącz skrypt <b>'+resourceName+'</b>, aby móc przeglądać i edytować jego treść.',
				position: 'center'
			});
		}
}


// usuwanie akcji pod enterem:
const forms = document.querySelectorAll('form');
for (const form of forms){
		form.addEventListener("submit",function(e){e.preventDefault(); return false;});
}

try {
	mta.triggerEvent('switchToScriptsList')
} catch (error) {
	console.warn(error);
}



document.getElementById('sideIcons').addEventListener('click', saveScript);
window.addEventListener('keypress', function(event) {
	if (!(event.which == 115 && event.ctrlKey) && !(event.which == 19)) return true;
	saveScriptKeyboardShortcut();
	event.preventDefault()
	return false;
})

Array.prototype.last = function() {
    return this[this.length - 1];
}

function saveScriptKeyboardShortcut(){
	const filename = currentlyEditing.replace(':', '').split('/').last();
	iziToast.question({
		layout: 1,
		drag: false,
		timeout: 10000,
		close: false,
		closeOnEscape: true,
		overlay: true,
		displayMode: 1,
		id: 'question',
		progressBar: true,
		title: 'CTRL+S',
		message: `Czy chcesz zapisać plik <b>${filename}</b>?`,
		position: 'center',
		buttons: [
			['<button><b>Zapisz</b></button>', function (instance, toast, button, e, inputs) {
				saveScript();
				instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
			}, true], // true to focus
			['<button>Anuluj</button>', function (instance, toast, button, e) {
				instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
			}]
		]
	});
}

function emulateESC(){
	document.dispatchEvent(new KeyboardEvent('keyup', {keyCode: 27}));
}

function saveScript(){
	const edit = document.getElementById('edit');
	if (!edit) return;
	if (edit.style.display != 'block') return;

	const resourceData = aeditor.getValue();
	mta.triggerEvent('saveScript', currentlyEditing, resourceData);
}

function askForRestart(){
	const resourceName = currentlyEditing.replace(':', '').split('/')[0];
	iziToast.question({
		layout: 1,
		drag: false,
		timeout: 10000,
		close: false,
		closeOnEscape: true,
		overlay: true,
		displayMode: 1,
		progressBar: true,
		title: 'Wprowadzenie zmian',
		message: `Czy chcesz ponownie uruchomić zasób <b>${resourceName}</b>?`,
		position: 'center',
		buttons: [
			['<button><b>Uruchom ponownie</b></button>', function (instance, toast, button, e, inputs) {
				mta.triggerEvent('restartResource-c', resourceName);
				instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
			}, true], // true to focus
			['<button>Anuluj</button>', function (instance, toast, button, e) {
				instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
			}]
		]
	});
}

const themes = {
	'Domyślny styl: Visual Studio Code (Dark)': 'vscode_dark',
	'Atom (Dark)': 'atom_dark',
	'GitHub': 'github',
	'Xcode': 'xcode',
	'Monokai': 'monokai',
	'Pastel on dark': 'pastel_on_dark',
	'Ambiance': 'ambiance',
	'Chaos': 'chaos',
	'Chrome': 'chrome',
	'Clouds': 'clouds',
	'Clouds midnight': 'clouds_midnight',
	'Cobalt': 'cobalt',
	'Crimson editor': 'crimson_editor',
	'Dawn': 'dawn',
	'Dracula': 'dracula',
	'Dreamweaver': 'dreamweaver',
	'Eclipse': 'eclipse',
	'Gob': 'gob',
	'Gruvbox': 'gruvbox',
	'Idle fingers': 'idle_fingers',
	'I-plastic': 'iplastic',
	'Katzenmilch': 'katzenmilch',
	'KR': 'kr_theme',
	'Kuroir': 'kuroir',
	'Merbivore': 'merbivore',
	'Merbivore soft': 'merbivore_soft',
	'Mono industrial': 'mono_industrial',
	'Nord (dark)': 'nord_dark',
	'Solarized (dark)': 'solarized_dark',
	'Solarized (light)': 'solarized_light',
	'SQL Server': 'sqlserver',
	'Terminal': 'terminal',
	'Textmate': 'textmate',
	'Tomorrow': 'tomorrow',
	'Tommorow Night': 'tomorrow_night',
	'Tomorrow Night - blue': 'tomorrow_night_blue',
	'Tomorrow Night - bright': 'tomorrow_night_bright',
	'Tomorrow Night - eighties': 'tomorrow_night_eihties',
	'Twilight': 'twilight',
	'Vibrant Ink': 'vibrant_ink'
};

function loadThemes(){
	const select = document.querySelector('.language');
	if (!select) return false;
	select.innerHTML = '';

	for (const theme in themes){
		let option = document.createElement('option');
		option.innerText = theme;
		select.appendChild(option);
	}
}
loadThemes();

function changeTheme(theme){
	if (!theme) return false;
	try {
		const newTheme = themes[theme.value];
		aeditor.setTheme(`ace/theme/${newTheme}`);
		iziToast.success({
			title: 'OK',
			message: `Zmieniono styl na <b>${(theme.value).replace('Domyślny styl: ', '')}</b>.`,
		});
	} catch (error) {
		iziToast.error({
			title: 'Błąd',
			message: `Wystąpił nieznany błąd przy zmianie stylu:\n'${error}`
		});
		return false;
	}
	return true;
}