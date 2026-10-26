import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as fetch } from "./fetch-article-kD_oaeJ3.mjs";
//#region lib/routes/twreporter/newest.ts
const route = {
	path: "/newest",
	categories: ["new-media"],
	example: "/twreporter/newest",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["twreporter.org/"] }],
	name: "最新",
	maintainers: ["emdoe"],
	handler,
	url: "twreporter.org/"
};
async function handler() {
	const base = "https://www.twreporter.org";
	const list = (await rofetch("https://go-api.twreporter.org/v2/index_page")).data.latest_section;
	return {
		title: "報導者 | 最新",
		link: base,
		item: await Promise.all(list.map((item) => {
			const title = item.title;
			return cache_default.tryGet(item.slug, async () => {
				const single = await fetch(item.slug);
				single.title = title;
				return single;
			});
		}))
	};
}
//#endregion
export { route };
