import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/xaut/rsc.ts
const route = {
	path: "/rsc/:category?",
	categories: ["university"],
	example: "/xaut/rsc/tzgg",
	parameters: { category: "通知类别，默认为通知公告" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "人事处",
	maintainers: ["mocusez", "light0926"],
	handler,
	description: `::: warning
有些内容指向外部链接，目前只提供这些链接，不提供具体内容，去除 jwc 和 index 的修改
:::

| 通知公告 | 工作动态 |
| :------: | :------: |
|   tzgg   |   gzdt   |`
};
async function handler(ctx) {
	let category = ctx.req.param("category");
	const dic_html = {
		tzgg: "tzgg.htm",
		gzdt: "gzdt.htm"
	};
	const dic_title = {
		tzgg: "通知公告",
		gzdt: "工作动态"
	};
	if (dic_title[category] === void 0) category = "tzgg";
	const data = (await got_default({
		method: "get",
		url: "http://renshichu.xaut.edu.cn/" + dic_html[category]
	})).body;
	const $ = load(data);
	const list = $(".vsb-space.n_right .list .cleafix").toArray().map((item) => {
		item = $(item);
		const a = item.find(".list_wen a").eq(0).attr("href");
		const link = a.slice(0, 4) === "http" ? a : "http://renshichu.xaut.edu.cn/" + a;
		return {
			title: item.find(".list_wen a.tit").text(),
			link
		};
	});
	return {
		title: "西安理工大学人事处-" + dic_title[category],
		link: "http://renshichu.xaut.edu.cn",
		description: "西安理工大学人事处-" + dic_title[category],
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			if (item.link.slice(0, 16) === "http://renshichu") {
				const content = load((await got_default({
					method: "get",
					url: item.link
				})).body);
				item.description = content(".vsb-space form[name]").html();
				item.pubDate = parseDate(content(".vsb-space form[name] h3 span:contains(时间)").text().slice(3));
			} else item.description = "这是一个外链(\"▔□▔)/(\"▔□▔)/所以你没法直接看到内容" + item.link;
			return item;
		})))
	};
}
//#endregion
export { route };
