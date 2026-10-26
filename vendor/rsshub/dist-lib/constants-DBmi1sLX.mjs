//#region lib/routes/kurogames/wutheringwaves/constants.ts
/** The language. */
let Language = /* @__PURE__ */ function(Language) {
	Language["English"] = "en";
	Language["Japanese"] = "jp";
	Language["Korean"] = "kr";
	/** Legacy code to ensure old results don't change. */
	Language["Chinese"] = "zh";
	Language["ChineseTaiwan"] = "zh-tw";
	Language["Spanish"] = "es";
	Language["French"] = "fr";
	Language["German"] = "de";
	return Language;
}({});
/** The languages supported by the API. */
const SUPPORTED_LANGUAGES = Object.values(Language);
//#endregion
export { SUPPORTED_LANGUAGES as n, Language as t };
