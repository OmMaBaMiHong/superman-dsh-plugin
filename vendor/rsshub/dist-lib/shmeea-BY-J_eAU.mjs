import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/shmeea/index.ts
const route = {
	path: "/:id?",
	categories: ["study"],
	example: "/shmeea/08000",
	parameters: { id: "页面 ID，可在 URL 中找到，默认为消息速递" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "消息",
	maintainers: ["jialinghui", "Misaka13514"],
	handler,
	description: `::: tip
例如：消息速递的网址为 \`https://www.shmeea.edu.cn/page/08000/index.html\`，则页面 ID 为 \`08000\`。
:::

::: warning
暂不支持大类分类和[院内动态](https://www.shmeea.edu.cn/page/19000/index.html)
:::`
};
async function handler(ctx) {
	const id = ctx.req.param("id") ?? "08000";
	const baseURL = "https://www.shmeea.edu.cn";
	const link = `${baseURL}/page/${id}/index.html`;
	const $ = load((await got_default(link)).data);
	const title = `上海市教育考试院-${$("#main .pageh4-tit").text().trim()}`;
	const list = $("#main .pageList li").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("a").attr("title") || item.find("a").text(),
			link: new URL(item.find("a").attr("href"), baseURL).href,
			pubDate: parseDate(item.find(".listTime").text().trim(), "YYYY-MM-DD")
		};
	});
	return {
		title,
		link,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			if (!item.link.endsWith(".html") || new URL(item.link).hostname !== new URL(baseURL).hostname) return item;
			const $ = load((await got_default(item.link)).data);
			const description = $("#ivs_content").html();
			const pbTimeText = $("#ivs_title .PBtime").text().trim();
			item.description = description;
			item.pubDate = pbTimeText ? timezone(parseDate(pbTimeText, "YYYY-MM-DD HH:mm:ss"), 8) : item.pubDate;
			return item;
		})))
	};
}
//#endregion
export { route };
