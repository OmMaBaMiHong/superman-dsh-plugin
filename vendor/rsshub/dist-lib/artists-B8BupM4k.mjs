import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as utils_default } from "./utils-DwATwC5q.mjs";
import { load } from "cheerio";
//#region lib/routes/furstar/artists.ts
const route = {
	path: "/artists/:lang?",
	categories: ["shopping"],
	example: "/furstar/artists/cn",
	parameters: { lang: "语言, 留空为jp, 支持cn, en" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["furstar.jp/"],
		target: "/artists"
	}],
	name: "画师列表",
	maintainers: ["NeverBehave"],
	handler,
	url: "furstar.jp/"
};
async function handler(ctx) {
	const base = utils_default.langBase(ctx.req.param("lang"));
	const artists = load((await got_default(base)).data)(".filter-item").toArray().map((e) => utils_default.authorDetail(e));
	artists.shift();
	return {
		title: "furstar 所有画家",
		link: "https://furstar.jp",
		description: "Furstar 所有画家列表",
		language: ctx.req.param("lang"),
		item: artists.map((e) => ({
			title: e.name,
			author: e.name,
			description: `<img src="${e.avatar}"/><a href="${base}/${e.link}">${e.name}</a>`,
			pubDate: parseDate((/* @__PURE__ */ new Date()).toISOString()),
			link: `${base}/${e.link}`
		}))
	};
}
//#endregion
export { route };
