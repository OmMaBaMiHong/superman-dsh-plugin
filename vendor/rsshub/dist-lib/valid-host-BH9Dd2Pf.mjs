//#region lib/utils/valid-host.ts
/**
* Check if a sub-domain is valid
* @param {String} hostname sub-domain
* @returns {Boolean} true if valid
*/
const isValidHost = (hostname) => {
	if (typeof hostname !== "string") return false;
	return /^[\dA-Z](?:[\dA-Z-]{0,61}[\dA-Z])?$/i.test(hostname);
};
//#endregion
export { isValidHost as t };
