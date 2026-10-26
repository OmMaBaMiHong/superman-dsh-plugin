import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as getItems } from "./items-processor-Xam83oUy.mjs";
import { load } from "cheerio";
//#region lib/routes/publico/internacional.ts
const route = {
	path: "/internacional/:subsection?",
	parameters: { subsection: { description: "Filter by subsection. Check the subsections available on the newspaper's website." } },
	categories: ["traditional-media"],
	example: "/publico/internacional",
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["publico.es/internacional"],
		target: "/internacional"
	}],
	name: "Internacional",
	maintainers: ["adrianrico97"],
	handler
};
async function handler(ctx) {
	const { subsection } = ctx.req.param();
	const rootUrl = "https://www.publico.es";
	const currentUrl = subsection ? `${rootUrl}/internacional/${subsection}` : `${rootUrl}/internacional`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const title = $(".article-section h1").text();
	const items = getItems($);
	return {
		title: `${title} | Público`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
