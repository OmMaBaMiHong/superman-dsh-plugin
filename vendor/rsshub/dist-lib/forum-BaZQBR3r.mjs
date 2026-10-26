import { t as PRESETS } from "./header-generator-DACPoxdp.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/qidian/forum.ts
const route = {
	path: "/forum/:id",
	categories: ["reading"],
	example: "/qidian/forum/1010400217",
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
	name: "讨论区",
	maintainers: ["fuzy112", "pseudoyu"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const $ = load((await got_default(`https://m.qidian.com/book/${id}.html`, { headerGeneratorOptions: PRESETS.MODERN_IOS })).data);
	const { pageContext } = JSON.parse($("#vite-plugin-ssr_pageContext").text());
	const pageData = pageContext.pageProps.pageData;
	const bookName = pageData.bookInfo?.bookName || "";
	const items = (pageData.seoBookCirclePost?.bookCirclePostList || []).map((post) => ({
		title: post.title,
		link: `https://book.qidian.com/info/${id}/`,
		description: post.circleReviewDesc,
		author: post.userName
	}));
	return {
		title: `起点 《${bookName}》讨论区`,
		link: `https://book.qidian.com/info/${id}/`,
		item: items
	};
}
//#endregion
export { route };
