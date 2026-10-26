import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/kaopu/news.ts
const route = {
	path: "/news/:language?",
	categories: ["new-media"],
	example: "/kaopu/news/zh-hans",
	parameters: { language: "语言" },
	radar: [{ source: ["kaopu.news/"] }],
	name: "全部",
	maintainers: ["fashioncj"],
	description: `| 简体中文 | 繁体中文 |
| -------- | -------- |
| zh-hans  | zh-hant  |`,
	handler
};
async function handler(ctx) {
	const { language } = ctx.req.param();
	const currentUrl = `https://kaopu.news/${language === "zh-hant" ? "zh-hant" : "index"}.html`;
	const items = (await got_default({
		method: "get",
		url: `https://kaopustorage.blob.core.windows.net/jsondata/news_list_beta_han${language === "zh-hant" ? "t" : "s"}_0.json`
	})).data.map((item) => ({
		link: item.link,
		title: item.title,
		author: item.publisher,
		pubDate: parseDate(item.pubDate),
		description: `<p>${item.description}</p>`
	}));
	return {
		title: language === "zh-hant" ? "靠譜新聞" : "靠谱新闻",
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
