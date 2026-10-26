import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as getList, t as getData } from "./utils-BSlXfjD0.mjs";
import { load } from "cheerio";
//#region lib/routes/grist/featured.ts
const route = {
	path: "/featured",
	categories: ["new-media"],
	example: "/grist/featured",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["grist.org/"] }],
	name: "Featured",
	maintainers: ["Rjnishant530"],
	handler,
	url: "grist.org/"
};
async function handler() {
	const baseUrl = "https://grist.org/";
	const { data: response } = await got_default(baseUrl);
	const $ = load(response);
	const listItems = $("li.hp-featured__tease").toArray().map((item) => {
		item = $(item);
		return { link: item.find(".small-tease__link").attr("href").split("/").at(-2) };
	});
	return {
		title: "Gist Featured Articles",
		link: baseUrl,
		item: await getList(await Promise.all(listItems.map((item) => cache_default.tryGet(item.link, async () => (await getData(`https://grist.org/wp-json/wp/v2/posts?slug='${item.link}'&_embed`))[0])))),
		description: "Featured Articles on Grist.org",
		logo: "https://grist.org/wp-content/uploads/2021/03/cropped-Grist-Favicon.png?w=192",
		icon: "https://grist.org/wp-content/uploads/2021/03/cropped-Grist-Favicon.png?w=32",
		language: "en-us"
	};
}
//#endregion
export { route };
