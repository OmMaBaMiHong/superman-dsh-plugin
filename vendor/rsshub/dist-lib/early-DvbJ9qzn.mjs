import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { n as fetchDesc, r as getItem, t as baseUrl } from "./utils-BRhLlhu12.mjs";
import { load } from "cheerio";
//#region lib/routes/science/early.ts
const route = {
	path: "/early/:journal?",
	categories: ["journal"],
	example: "/science/early",
	parameters: { journal: "Short name for a journal" },
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: true
	},
	radar: [{
		source: ["science.org/journal/:journal", "science.org/toc/:journal/0/0"],
		target: "/early/:journal"
	}],
	name: "First Release",
	maintainers: ["y9c", "TonyRL"],
	handler,
	description: "*only Science, Science Immunology and Science Translational Medicine have first release*"
};
async function handler(ctx) {
	const { journal = "science" } = ctx.req.param();
	const pageUrl = `${baseUrl}/toc/${journal}/0/0`;
	const { data: res } = await got_default(pageUrl, { headers: { cookie: "cookiePolicy=iaccept;" } });
	const $ = load(res);
	const list = $(".card-content .card-header").toArray().map((item) => getItem(item, $));
	const context = await outPlaywright();
	const items = await fetchDesc(list, context);
	await context.close();
	return {
		title: $("head title").text(),
		description: $(".body02").text().trim(),
		image: `${baseUrl}/apple-touch-icon.png`,
		link: pageUrl,
		language: "en-US",
		item: items
	};
}
//#endregion
export { route };
