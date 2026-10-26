import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/paradigm/writing.ts
const baseUrl = "https://www.paradigm.xyz";
const route = {
	path: "/writing",
	categories: ["finance"],
	example: "/paradigm/writing",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["paradigm.xyz/writing"] }],
	name: "Writing",
	maintainers: ["Fatpandac"],
	handler,
	url: "paradigm.xyz/writing"
};
async function handler() {
	const url = `${baseUrl}/writing`;
	const $ = load((await got_default(url)).data);
	const nextData = JSON.parse($("#__NEXT_DATA__").text());
	const buildId = nextData.buildId;
	const list = nextData.props.pageProps.posts.map((item) => ({
		title: item.title,
		link: `${baseUrl}${item.slug}`,
		api: `${baseUrl}/_next/data/${buildId}${item.slug}.json`,
		author: item.authors.map((author) => author.name).join(", "),
		pubDate: parseDate(item.originalDate),
		category: item.tags
	}));
	return {
		title: "Paradigm - Writing",
		link: url,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const $ = load((await got_default(item.api)).data.pageProps.content, null, false);
			$(".toc").remove();
			item.description = $.html();
			return item;
		})))
	};
}
//#endregion
export { route };
