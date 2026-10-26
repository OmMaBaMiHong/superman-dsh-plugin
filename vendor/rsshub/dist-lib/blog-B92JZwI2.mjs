import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { load } from "cheerio";
//#region lib/routes/imhcg/blog.ts
const route = {
	path: "/",
	categories: ["blog"],
	view: 5,
	example: "/imhcg",
	parameters: {},
	radar: [{ source: ["infos.imhcg.cn"] }],
	name: "Engineering blogs",
	maintainers: ["ZiHao256", "qzydustin"],
	handler,
	url: "infos.imhcg.cn"
};
async function handler() {
	const $ = load(await rofetch("https://infos.imhcg.cn/"));
	return {
		title: "Engineering Blogs",
		link: "https://infos.imhcg.cn/",
		item: $("li").toArray().map((item) => {
			return {
				title: $(item).find("a.article-title").text(),
				link: $(item).find("a.article-title").attr("href"),
				author: $(item).find("p.article-author").text(),
				time: $(item).find("p.article-time").text(),
				description: $(item).find("p.article-text").text()
			};
		})
	};
}
//#endregion
export { route };
