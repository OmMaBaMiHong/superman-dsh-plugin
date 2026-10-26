import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
import iconv from "iconv-lite";
//#region lib/routes/wenku8/chapter.ts
const route = {
	path: "/chapter/:id",
	categories: ["reading"],
	example: "/wenku8/chapter/74",
	parameters: { id: "小说 id, 可在对应小说页 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "章节",
	maintainers: ["zsakvo"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const index = Number.parseInt(id / 1e3);
	const response = await got_default({
		method: "get",
		url: `https://www.wenku8.net/novel/${index}/${id}/index.htm`,
		responseType: "buffer"
	});
	const $ = load(iconv.decode(response.data, "gbk"));
	const name = $("#title").text();
	const chapter_item = [];
	$(".ccss>a").each((_, el) => {
		chapter_item.push({
			title: $(el).text(),
			link: `https://www.wenku8.net/novel/${index}/${id}/` + $(el).attr("href")
		});
	});
	return {
		title: `轻小说文库 ${name}`,
		link: `https://www.wenku8.net/book/${id}.htm`,
		item: chapter_item
	};
}
//#endregion
export { route };
