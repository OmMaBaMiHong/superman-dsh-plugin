import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/typora/changelog-dev.ts
const route = {
	path: "/changelog/dev",
	categories: ["program-update"],
	example: "/typora/changelog/dev",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["support.typora.io/"],
		target: "/changelog"
	}],
	name: "Dev Release Changelog",
	maintainers: ["nczitzk"],
	handler,
	url: "support.typora.io/"
};
async function handler() {
	const currentUrl = "https://typora.io/releases/dev";
	const $ = load((await got_default(currentUrl)).data);
	return {
		title: "Typora Changelog - Dev",
		link: currentUrl,
		description: "Typora Changelog",
		item: $("h2").toArray().map((item) => {
			item = $(item);
			return {
				title: item.text(),
				link: `${currentUrl}#${item.text()}`,
				description: item.nextUntil("h2").toArray().map((item) => $(item).html()).join("")
			};
		})
	};
}
//#endregion
export { route };
