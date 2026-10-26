import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as utils_default } from "./utils-DwATwC5q.mjs";
//#region lib/routes/furstar/archive.ts
const route = {
	path: "/archive/:lang?",
	categories: ["shopping"],
	example: "/furstar/archive/cn",
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
		source: ["furstar.jp/:lang/archive.php", "furstar.jp/archive.php"],
		target: "/archive/:lang"
	}],
	name: "已经出售的角色列表",
	maintainers: ["NeverBehave"],
	handler
};
async function handler(ctx) {
	const base = utils_default.langBase(ctx.req.param("lang"));
	const res = await got_default(`${base}/archive.php`);
	const info = utils_default.fetchAllCharacters(res.data, base);
	return {
		title: "Furstar 已出售角色",
		link: "https://furstar.jp",
		description: "Furstar 已经出售或预订的角色列表",
		language: ctx.req.param("lang"),
		item: info.map((e) => ({
			title: e.title,
			author: e.author.name,
			description: `<img src="${e.headImage}"/> ${utils_default.renderAuthor(e.author)}`,
			pubDate: parseDate((/* @__PURE__ */ new Date()).toISOString()),
			link: e.detailPage
		}))
	};
}
//#endregion
export { route };
