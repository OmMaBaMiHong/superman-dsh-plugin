import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as cookieJar, t as baseUrl } from "./utils-8wIE3g81.mjs";
import { load } from "cheerio";
//#region lib/routes/nature/siteindex.ts
const route = {
	path: "/siteindex",
	categories: ["journal"],
	example: "/nature/siteindex",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Journal List",
	maintainers: ["TonyRL", "pseudoyu"],
	handler
};
async function handler(ctx) {
	const response = await got_default(`${baseUrl}/siteindex`, { cookieJar });
	const $ = load(response.data);
	let items = $("li[class^=\"grid mq640-grid-12\"]").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("a").attr("href").replaceAll("/", ""),
			name: item.find("a").text(),
			link: baseUrl + item.find("a").attr("href")
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(`nature:siteindex:${item.title}`, async () => {
		try {
			const imgSrc = load((await got_default(item.link, { cookieJar })).data)(".app-latest-issue-row__image img").attr("src");
			if (imgSrc) {
				const match = imgSrc.match(/.*\/journal\/(\d{5})/);
				if (match) {
					const id = match[1];
					return {
						title: item.title,
						name: item.name,
						id,
						description: id
					};
				}
			}
			return {
				title: item.title,
				name: item.name
			};
		} catch {
			return {
				title: item.title,
				name: item.name
			};
		}
	})));
	ctx.set("json", { items });
	return {
		title: "Nature siteindex",
		link: response.url,
		item: items
	};
}
//#endregion
export { route };
