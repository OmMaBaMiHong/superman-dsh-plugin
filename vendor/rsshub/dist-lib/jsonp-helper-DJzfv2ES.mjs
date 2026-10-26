//#region lib/routes/yoasobi-music/jsonp-helper.ts
function parseJSONP(jsonpData) {
	try {
		const startPos = jsonpData.indexOf("({");
		const endPos = jsonpData.lastIndexOf("})");
		let jsonString = jsonpData.slice(startPos + 1, endPos + 1);
		jsonString = jsonString.replaceAll(String.raw`\'`, "'");
		return JSON.parse(jsonString);
	} catch (error_) {
		throw /* @__PURE__ */ new Error(`Failed to convert jsonp to json. ${error_.message}`);
	}
}
//#endregion
export { parseJSONP as t };
