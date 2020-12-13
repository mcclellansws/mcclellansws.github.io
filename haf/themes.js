
var today = new Date();
var expiry = new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000);

// returns the cookie with the given name,
// or undefined if not found
function getCookie(name) {
	let matches = document.cookie.match(new RegExp(
		"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
	));
	return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value, options = {}) {

	options = {
		path: '/',
		// add other defaults here if necessary
		...options
	};

	if (options.expires instanceof Date) {
		options.expires = options.expires.toUTCString();
	}

	let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

	for (let optionKey in options) {
		updatedCookie += "; " + optionKey;
		let optionValue = options[optionKey];
		if (optionValue !== true) {
			updatedCookie += "=" + optionValue;
		}
	}

	document.cookie = updatedCookie;
}

function deleteCookie(name) {
	setCookie(name, "", {
		'max-age': -1
	})
}

var THEME_KEY = "haf_theme";	// this key is used to store the selected theme.
var THEMES_FOLDER_PATH = "themes/";
var DEFAULT_THEME = "theme_default";

function insertStyleSheet() {
	var s = getCookie(THEME_KEY);
	if (s == null) s = DEFAULT_THEME;
	document.writeln('<link href="' + THEMES_FOLDER_PATH + s + '.css" type="text/css" rel="stylesheet">');
}

function setTheme() {
	deleteCookie(THEME_KEY);
	maxage = 365 * 24 * 60 * 60;
	options = {
		// domain: 'github.io',
		samesite: 'strict',
		// secure: true,
		'max-age': maxage
	}
	console.log(options)
	setCookie(THEME_KEY, document.getElementById('selectTheme').value, options);
	self.location = self.location;	// simple trick to reload the current document
}

insertStyleSheet();