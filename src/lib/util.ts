import { customAlphabet } from 'nanoid';

export function isSafari() {
	// Detect Chrome
	let chrome_agent = navigator.userAgent.indexOf('Chrome') > -1;
	// Detect Safari
	let safari_agent = navigator.userAgent.indexOf('Safari') > -1;
	// Discard Safari since it also matches Chrome
	if (chrome_agent && safari_agent) safari_agent = false;
	return safari_agent;
}

const _nanoid = customAlphabet(
	'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
	21
);

export function nanoid() {
	return _nanoid();
}
