import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as parseItem } from "./utils-c_5W0_zD.mjs";
import { load } from "cheerio";
//#region lib/routes/gelonghui/subject.ts
const route = {
	path: "/subject/:id",
	categories: ["finance"],
	view: 0,
	example: "/gelonghui/subject/4",
	parameters: { id: "主题编号，可在主题页 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["gelonghui.com/subject/:id"] }],
	name: "主题文章",
	maintainers: ["nczitzk"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const apiUrl = `https://www.gelonghui.com/api/subjects/${id}/contents`;
	const { data: response } = await got_default(`https://www.gelonghui.com/subject/${id}`);
	const { data } = await got_default(apiUrl, { searchParams: { isChoice: false } });
	const $ = load(response);
	const list = data.result.map((item) => ({
		title: item.title,
		description: item.summary,
		link: item.link,
		author: item.source,
		pubDate: parseDate(item.timestamp, "X")
	}));
	const items = await Promise.all(list.map((item) => parseItem(item)));
	return {
		title: `格隆汇 - 主题 ${$("span.user-nick").text()} 的文章`,
		description: $("div.user-name").parent().children("p").text(),
		image: $(".subject-list-title").find("img").attr("data-src"),
		link: `https://www.gelonghui.com/subject/${id}`,
		item: items
	};
}
//#endregion
export { route };
