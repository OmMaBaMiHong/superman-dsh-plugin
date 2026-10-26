import { t as PRESETS } from "./header-generator-DACPoxdp.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/qidian/free-next.ts
const route = {
	path: "/free-next/:type?",
	categories: ["reading"],
	example: "/qidian/free-next",
	parameters: { type: "默认不填为起点中文网，填 mm 为起点女生网" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.qidian.com/free"],
		target: "/free"
	}],
	name: "限时免费下期预告",
	maintainers: ["LogicJake", "pseudoyu"],
	handler,
	url: "www.qidian.com/free"
};
async function handler(ctx) {
	const isMM = ctx.req.param("type") === "mm";
	const link = isMM ? "https://www.qidian.com/mm/free" : "https://www.qidian.com/free";
	const title = isMM ? "起点女生网" : "起点中文网";
	const $ = load((await got_default("https://m.qidian.com/free", { headerGeneratorOptions: PRESETS.MODERN_IOS })).data);
	const { pageContext } = JSON.parse($("#vite-plugin-ssr_pageContext").text());
	const items = (pageContext.pageProps.pageData.nxtFree || []).map((book) => ({
		title: book.bName,
		link: `https://book.qidian.com/info/${book.bid}/`,
		author: book.bAuth,
		description: `评分：${book.score === -1 ? "暂无" : book.score}`
	}));
	return {
		title,
		description: `限时免费下期预告-${title}`,
		link,
		item: items
	};
}
//#endregion
export { route };
