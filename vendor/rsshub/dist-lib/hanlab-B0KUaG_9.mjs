import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/mit/hanlab.ts
const route = {
	path: "/hanlab/blog",
	categories: ["blog"],
	example: "/mit/hanlab/blog",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["hanlab.mit.edu/blog"] }],
	name: "HAN Lab Blog",
	maintainers: ["johan456789"],
	handler,
	description: "MIT HAN Lab pioneers research in efficient AI, advancing algorithms and hardware to make generative models faster, smarter, and more accessible."
};
async function handler() {
	const rootUrl = "https://hanlab.mit.edu";
	const currentUrl = `${rootUrl}/blog`;
	const $ = load((await got_default(currentUrl)).data);
	return {
		title: "MIT HAN Lab Blog",
		link: currentUrl,
		item: $("a.post-card-wrapper").toArray().map((item) => {
			const el = $(item);
			return {
				title: el.find("h3.text-title").text().trim(),
				link: new URL(el.attr("href") ?? "", rootUrl).href,
				description: el.find("p.text-tldr").html() ?? void 0,
				pubDate: parseDate(el.find("div.text-date").text().trim())
			};
		})
	};
}
//#endregion
export { route };
