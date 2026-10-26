import { t as handler } from "./common-CyxaSYUe.mjs";
//#region lib/routes/wnacg/tag.ts
const route = {
	name: "標籤更新",
	maintainers: ["Gandum2077"],
	path: "/tag/:tag",
	example: "/wnacg/tag/漢化",
	radar: [{
		source: ["wnacg.com/*"],
		target: (_, url) => `/wnacg/tag/${new URL(url).pathname.match(/albums-index-tag-(.+?)\.html$/)[1]}`
	}],
	handler,
	url: "wnacg.com/albums.html",
	features: { nsfw: true }
};
//#endregion
export { route };
