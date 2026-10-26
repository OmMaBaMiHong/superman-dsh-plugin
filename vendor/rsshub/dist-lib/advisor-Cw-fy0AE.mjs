import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/github/advisor.ts
const route = {
	path: "/advisor/data/:type?/:category?",
	categories: ["programming"],
	example: "/github/advisor/data/reviewed/composer",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["github.com/advisories", "github.com"] }],
	name: "Github Advisory Database RSS",
	maintainers: ["sd0ric4"],
	handler,
	description: `| Type       | Description | Explanation |
| ---------- | ----------- | ----------- |
| reviewed   | Reviewed    | 已审核      |
| unreviewed | Unreviewed  | 未审核      |

| Category | Description | Explanation        |
| -------- | ----------- | ------------------ |
| composer | Composer    | PHP 依赖管理工具   |
| go       | Go          | Go 语言包管理工具  |
| maven    | Maven       | Java 项目管理工具  |
| npm      | NPM         | Node.js 包管理工具 |
| nuget    | NuGet       | .NET 包管理工具    |
| pip      | Pip         | Python 包管理工具  |
| pub      | Pub         | Dart 包管理工具    |
| rubygems | RubyGems    | Ruby 包管理工具    |
| rust     | Rust        | Rust 包管理工具    |
| erlang   | Erlang      | Erlang 包管理工具  |
| actions  | Actions     | GitHub Actions     |
| swift    | Swift       | Swift 包管理工具   |`
};
async function handler(ctx) {
	const { category, type } = ctx.req.param();
	const apiUrl = `https://github.com/advisories?query=type%3A${type}+ecosystem%3A${category}`;
	const currentUrl = "https://github.com/advisories";
	const $ = load((await got_default({
		method: "get",
		url: apiUrl
	})).data);
	const list = $("div.Box-row").toArray().map((item) => {
		item = $(item);
		const a = item.find("a.Link--primary");
		const b = item.find("relative-time").attr("datetime");
		const title = a.text() || "No title";
		const link = a.attr("href") || "#";
		const pubDate = parseDate(b || "");
		return {
			title,
			link: `https://github.com${link}`,
			pubDate,
			description: ""
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load(await rofetch(item.link))(".comment-body").first().html() || "";
		return item;
	})));
	return {
		title: `GitHub Advisory Database RSS - ${category} - ${type}`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
