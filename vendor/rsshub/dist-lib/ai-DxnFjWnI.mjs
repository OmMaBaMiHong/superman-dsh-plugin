import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/ruc/ai.ts
const route = {
	path: "/ai/:category?",
	categories: ["university"],
	example: "/ruc/ai",
	parameters: { category: "分类，见下方说明，默认为首页公告" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["ai.ruc.edu.cn/"] }],
	name: "高瓴人工智能学院",
	maintainers: ["yinhanyan"],
	handler: async (ctx) => {
		const baseURL = `http://ai.ruc.edu.cn/${ctx.req.param("category")?.replaceAll("-", "/") ?? "newslist/notice"}/`;
		const indexUrl = baseURL + "index.htm";
		const $ = load(await rofetch(indexUrl));
		const pageTitle = $("title").text();
		const list = $("div.fr li").toArray().map((item) => {
			item = $(item);
			const a = item.find("a").first();
			return { link: baseURL + a.attr("href") };
		});
		return {
			title: pageTitle,
			link: indexUrl,
			icon: "https://www.ruc.edu.cn/favicon.ico",
			logo: "http://ai.ruc.edu.cn/images/cn_ruc_logo.png",
			item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
				try {
					const $ = load(await rofetch(item.link));
					item.title = $("title").text();
					const date = $("div.tit").find("span").first().text();
					item.pubDate = timezone(parseDate(/\d+-\d+-\d+/.exec(date)[0]), 8);
					item.description = $("div.fr").children().slice(3).toArray().map((el) => $.html(el)).join("");
				} catch {
					item.description = "";
				}
				return item;
			})))
		};
	},
	url: "ai.ruc.edu.cn/",
	description: `::: tip
分类字段处填写的是对应中国人民大学高瓴人工智能学院分类页网址中介于 **\`http://ai.ruc.edu.cn/\`** 和 **/index.htm** 中间的一段，并将其中的 \`/\` 修改为 \`-\`。

如 [中国人民大学高瓴人工智能学院 - 新闻公告 - 学院新闻](http://ai.ruc.edu.cn/newslist/newsdetail/index.htm) 的网址为 \`http://ai.ruc.edu.cn/newslist/newsdetail/index.htm\` 其中介于 **\`http://ai.ruc.edu.cn/\`** 和 **/index.htm** 中间的一段为 \`newslist/newsdetail\`。随后，并将其中的 \`/\` 修改为 \`-\`，可以得到 \`newslist-newsdetail\`。所以最终我们的路由为 [\`/ruc/ai/newslist-newsdetail\`](https://rsshub.app/ruc/ai/newslist-newsdetail)
:::`
};
//#endregion
export { route };
