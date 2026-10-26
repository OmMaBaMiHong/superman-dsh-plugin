import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/lsnu/jiaowc/tzgg.ts
const route = {
	path: "/jiaowc/tzgg/:category?",
	categories: ["university"],
	example: "/lsnu/jiaowc/tzgg",
	parameters: { category: "分类名" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["lsnu.edu.cn/"],
		target: "/jiaowc/tzgg"
	}],
	name: "教学部通知公告",
	maintainers: ["nyaShine"],
	handler,
	url: "lsnu.edu.cn/",
	description: `| 实践教学科 | 教育运行科 | 教研教改科 | 学籍管理科 | 考试科 | 教材建设管理科 |
| ---------- | ---------- | ---------- | ---------- | ------ | -------------- |
| sjjxk      | jxyxk      | jyjgk      | xjglk      | ksk    | jcjsglk        |`
};
async function handler(ctx) {
	const category = ctx.req.param("category");
	const data = (await got_default({
		method: "get",
		url: category ? `https://jiaowc.lsnu.edu.cn/tzgg/${category}.htm` : "https://jiaowc.lsnu.edu.cn/tzgg.htm"
	})).data;
	const list = load(data)("tr[id^=\"line_u5_\"]").toArray();
	return {
		title: "乐山师范学院教学部通知公告",
		link: "https://jiaowc.lsnu.edu.cn/tzgg.htm",
		item: await Promise.all(list.map(async (item) => {
			const $ = load(item);
			const title = $("a").attr("title");
			const link = `https://jiaowc.lsnu.edu.cn/${$("a").attr("href")}`;
			const date = $("td[width=\"80\"]").text();
			return await cache_default.tryGet(link, async () => {
				const articleData = (await got_default({
					method: "get",
					url: link
				})).data;
				const description = load(articleData)(".v_news_content").html();
				return {
					title,
					link,
					description,
					pubDate: new Date(date).toUTCString()
				};
			});
		}))
	};
}
//#endregion
export { route };
