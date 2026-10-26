import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as fetchArticles } from "./utils-BSjgDsaS.mjs";
//#region lib/routes/infzm/hot.ts
const route = {
	path: "/hot",
	parameters: {},
	categories: ["traditional-media"],
	example: "/infzm/hot",
	radar: [{ source: ["infzm.com/"] }],
	name: "热门文章",
	maintainers: [
		"KarasuShin",
		"ranpox",
		"xyqfer"
	],
	handler
};
async function handler() {
	const link = "https://www.infzm.com/";
	const { data } = await got_default({
		method: "get",
		url: "https://www.infzm.com/hot_contents",
		headers: { Referer: link }
	});
	return {
		title: "南方周末-热门文章",
		link,
		image: "https://www.infzm.com/favicon.ico",
		item: await fetchArticles(data.data.hot_contents)
	};
}
//#endregion
export { route };
