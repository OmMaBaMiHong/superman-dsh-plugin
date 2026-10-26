import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { n as extractNews, t as baseUrl } from "./utils-Cxt2ik80.mjs";
import { load } from "cheerio";
//#region lib/routes/visionias/weekly-focus.ts
const route = {
	path: "/weeklyFocus",
	example: "/visionias/weeklyFocus",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["visionias.in/current-affairs/weekly-focus"],
		target: "/weeklyFocus"
	}],
	name: "Weekly Focus",
	maintainers: ["Rjnishant530"],
	handler
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 1;
	const $ = load(await rofetch(`${baseUrl}/current-affairs/weekly-focus/archive`));
	const individualLinks = $("div.weekly-focus-single-card").slice(0, limit).toArray().flatMap((card) => $(card).find("a:has(p)").toArray().map((item) => {
		const link = $(item).attr("href");
		return { link: link?.startsWith("http") ? link : `${baseUrl}${link}` };
	}));
	const itemsPromise = await Promise.allSettled(individualLinks.map(({ link }) => extractNews({ link }, "main > div > div.flex > div.flex.w-full > div.w-full.mt-6")));
	return {
		title: "Weekly Focus | Current Affairs | Vision IAS",
		link: `${baseUrl}/current-affairs/weekly-focus/archive`,
		description: "Weekly Focus provides weekly comprehensive analysis of current themes with multidimensional and consolidated content.",
		language: "en",
		item: itemsPromise.map((item) => item.status === "fulfilled" ? item.value : { title: "Error Parse News" }),
		image: `${baseUrl}/current-affairs/images/weekly-focus-logo.svg`,
		icon: "https://cdn.visionias.in/new-system-assets/images/home_page/home/vision-logo-footer.png",
		logo: "https://cdn.visionias.in/new-system-assets/images/home_page/home/vision-logo-footer.png",
		allowEmpty: true
	};
}
//#endregion
export { route };
