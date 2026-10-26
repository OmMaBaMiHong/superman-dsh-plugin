import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/zhibo8/post.ts
const route = {
	path: "/post/:id",
	categories: ["bbs"],
	example: "/zhibo8/post/3050708",
	parameters: { id: "帖子 id，可在帖子 URL 找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "回帖",
	maintainers: ["LogicJake"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const link = `https://bbs.zhibo8.cc/forum/topic?tid=${id}`;
	const $ = load((await got_default(link)).data);
	const title = $("div.topic-title > h1").text();
	const out = $(".topic-content .topic-table").toArray().map((item) => {
		item = $(item);
		const author = item.find(".topic-left > div > a").text();
		const floor = item.find("p.topic-foot span:nth-child(2)").text();
		const description = item.find(".detail_ent").html().replaceAll("src=\"", "src=\"https:");
		const pubDate = timezone(parseDate(item.find("p.topic-foot").text().match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/)[0], "YYYY-MM-DD HH:mm"), 8);
		return {
			title: `${floor}：${author}发表了新回复`,
			author,
			description,
			link,
			pubDate,
			guid: `zhibo8:post:${id}:${floor}`
		};
	});
	return {
		title: `“${title}”的新回复—直播吧`,
		link,
		item: out
	};
}
//#endregion
export { route };
