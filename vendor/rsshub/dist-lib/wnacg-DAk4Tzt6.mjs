import { t as handler } from "./common-CyxaSYUe.mjs";
//#region lib/routes/wnacg/index.ts
const route = {
	name: "最新",
	maintainers: ["KenMizz"],
	path: "/",
	example: "/wnacg",
	radar: [{ source: ["wnacg.com/albums.html", "wnacg.com/"] }],
	handler,
	url: "wnacg.com/albums.html",
	features: { nsfw: true }
};
//#endregion
export { route };
