import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as PRESETS } from "./header-generator-DACPoxdp.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/qidian/chapter.ts
const route = {
	path: "/chapter/:id",
	categories: ["reading"],
	view: 5,
	example: "/qidian/chapter/1010400217",
	parameters: { id: "小说 id, 可在对应小说页 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["book.qidian.com/info/:id"] }],
	name: "作品章节",
	maintainers: ["fuzy112", "pseudoyu"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const $ = load((await got_default(`https://m.qidian.com/book/${id}.html`, { headerGeneratorOptions: PRESETS.MODERN_IOS })).data);
	const name = $("meta[property=\"og:title\"]").attr("content");
	const coverUrl = `https:${$(".detail__header-cover__img").attr("src")}`;
	const { data: catalog } = await got_default(`https://m.qidian.com/book/${id}/catalog/`, { headerGeneratorOptions: PRESETS.MODERN_IOS });
	const $c = load(catalog);
	const { pageContext } = JSON.parse($c("#vite-plugin-ssr_pageContext").text());
	const chapterItem = pageContext.pageProps.pageData.vs.flatMap((v) => v.cs).map((c) => ({
		title: c.cN,
		pubDate: parseDate(c.uT),
		link: `https://vipreader.qidian.com/chapter/${id}/${c.id}`
	}));
	return {
		title: `起点 ${name}`,
		link: `https://book.qidian.com/info/${id}`,
		description: $("#bookSummary content").text(),
		image: coverUrl,
		item: chapterItem
	};
}
//#endregion
export { route };
