import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as renderDescription } from "./description-CoWomRj3.mjs";
import { load } from "cheerio";
//#region lib/routes/ieee/author.ts
const route = {
	name: "IEEE Author Articles",
	maintainers: ["Derekmini"],
	categories: ["journal"],
	path: "/author/:aid/:sortType",
	parameters: {
		aid: "Author ID",
		sortType: "Sort Type of papers"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: true
	},
	example: "/ieee/author/37264968900/newest",
	handler
};
async function handler(ctx) {
	const { aid, sortType } = ctx.req.param();
	const count = ctx.req.query("limit") || 10;
	const host = "https://ieeexplore.ieee.org";
	const author = (await rofetch(`${host}/rest/author/${aid}`))[0];
	const title = `${author.preferredName} on IEEE Xplore`;
	const link = `${host}/author/${aid}`;
	const description = author.bioParagraphs.join(" ");
	const image = `${host}${author.photoUrl}`;
	const list = (await rofetch(`${host}/rest/search`, {
		method: "POST",
		body: {
			rowsPerPage: count,
			searchWithin: [`"Author Ids": ${aid}`],
			sortType
		}
	})).records.map((item) => ({
		title: item.articleTitle,
		link: item.htmlLink,
		doi: item.doi,
		authors: "authors" in item ? item.authors.map((itemAuth) => itemAuth.preferredName).join("; ") : "Do not have author",
		abstract: "abstract" in item ? item.abstract : ""
	}));
	return {
		title,
		link,
		description,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			if (item.abstract !== "") {
				const metadataMatch = load(await rofetch(`${host}${item.link}`, { parseResponse: (txt) => txt })).html().match(/metadata=(.*);/);
				const metadata = metadataMatch ? JSON.parse(metadataMatch[1]) : null;
				item.pubDate = metadata?.insertDate ? parseDate(metadata.insertDate) : void 0;
				item.abstract = load(metadata?.abstract || "").text();
			}
			return {
				...item,
				description: renderDescription(item)
			};
		}))),
		image
	};
}
//#endregion
export { route };
