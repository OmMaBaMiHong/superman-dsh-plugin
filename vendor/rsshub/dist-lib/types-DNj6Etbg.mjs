//#region lib/types.ts
let ViewType = /* @__PURE__ */ function(ViewType) {
	ViewType[ViewType["Articles"] = 0] = "Articles";
	ViewType[ViewType["SocialMedia"] = 1] = "SocialMedia";
	ViewType[ViewType["Pictures"] = 2] = "Pictures";
	ViewType[ViewType["Videos"] = 3] = "Videos";
	ViewType[ViewType["Audios"] = 4] = "Audios";
	ViewType[ViewType["Notifications"] = 5] = "Notifications";
	return ViewType;
}({});
//#endregion
export { ViewType as t };
