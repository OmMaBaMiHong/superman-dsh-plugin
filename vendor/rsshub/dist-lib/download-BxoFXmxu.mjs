import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/neatdownloadmanager/download.ts
const route = {
	path: "/download/:os?",
	categories: ["program-update"],
	example: "/neatdownloadmanager/download",
	parameters: { os: "Operating system, windows or macos, all by default" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["neatdownloadmanager.com/index.php", "neatdownloadmanager.com/"] }],
	name: "Download",
	maintainers: ["nczitzk"],
	handler,
	url: "neatdownloadmanager.com/index.php"
};
async function handler(ctx) {
	const os = (ctx.req.param("os") ?? "").toLowerCase();
	const rootUrl = "https://www.neatdownloadmanager.com";
	const currentUrl = `${rootUrl}/index.php`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	return {
		title: "Neat Download Manager",
		link: currentUrl,
		item: $(".p1").toArray().filter((item) => {
			item = $(item);
			const isMacOS = item.text().startsWith("dmg");
			if (os !== "") return os === "macos" ? isMacOS : !isMacOS;
			return true;
		}).map((item) => {
			item = $(item);
			const text = item.text();
			const version = text.match(/\(ver (.*?)\)/)[1];
			return {
				title: `[${text.startsWith("dmg") ? "macOS" : "Windows"}] ${text}`,
				link: `${rootUrl}${item.prev().find("a").attr("href")}#${version}`
			};
		})
	};
}
//#endregion
export { route };
