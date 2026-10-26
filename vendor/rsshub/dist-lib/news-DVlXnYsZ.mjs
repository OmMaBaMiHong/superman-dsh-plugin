import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/shisu/news.ts
const url = "https://news.shisu.edu.cn";
const banner = "https://news.shisu.edu.cn/news/index/39adf3d9ae414bc39c6d3b9316ae531f.png";
const route = {
	path: "/news/:section",
	categories: ["university"],
	example: "/shisu/news/news",
	parameters: { section: "主站的新闻类别" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["news.shisu.edu.cn/:section/index.html"],
		target: "/news/:section"
	}],
	name: "上外新闻",
	maintainers: ["Duuckjing"],
	handler,
	description: `| 首页 | 特稿    | 学术      | 教学       | 国际          | 校园   | 人物   | 视讯       | 公告   |
| ---- | ------- | --------- | ---------- | ------------- | ------ | ------ | ---------- | ------ |
| news | gazette | research- | academics- | international | campus | people | multimedia | notice |`
};
async function handler(ctx) {
	const { section = "news" } = ctx.req.param();
	const $ = load(await rofetch(`${url}/${section}/index.html`));
	let itemsoup;
	switch (section) {
		case "news":
			itemsoup = $("#gallery-wrapper > article").toArray().map((i0) => {
				const i = $(i0);
				const img = i.find("img").attr("src");
				return {
					title: i.find("a").text().trim(),
					link: `${url}${i.find("a").attr("href")}`,
					category: i.find(".in-con02 > span:nth-child(1)").text(),
					itunes_item_image: `${url}${img}`
				};
			});
			break;
		default: itemsoup = $("li.clear").toArray().map((i0) => {
			const i = $(i0);
			return {
				title: i.find("h3>a").attr("title")?.trim(),
				link: `${url}${i.find("h3>a").attr("href")}`,
				category: i.find("p>span:nth-child(1)").text()
			};
		});
	}
	const items = await Promise.all(itemsoup.map((j) => cache_default.tryGet(j.link, async () => {
		const $ = load(await rofetch(j.link));
		const img = $(".tempWrap > ul > li:nth-child(1)> img").attr("src");
		j.description = $(".ot_main_r .content").html();
		j.author = $(".math_time_l > span:nth-child(3)").text().trim();
		j.pubDate = parseDate($(".math_time_l > span:nth-child(2)").text(), "YYYY-MM-DD");
		if (!j.itunes_item_image) j.itunes_item_image = img ? `${url}${img}` : banner;
		return j;
	})));
	return {
		title: `上外新闻|SISU TODAY - ${section.charAt(0).toUpperCase() + section.slice(1)}`,
		image: "https://upload.wikimedia.org/wikipedia/zh/thumb/0/06/Shanghai_International_Studies_University_logo.svg/300px-Shanghai_International_Studies_University_logo.svg.png",
		link: `${url}/${section}/index.html`,
		item: items
	};
}
//#endregion
export { route };
