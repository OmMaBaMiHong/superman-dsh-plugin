import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/sciencedirect/cf-email.ts
const decodeCFEmail = (encoded) => {
	const parseHex = (string, position) => Number.parseInt(string.slice(position, position + 2), 16);
	let decoded = "";
	const key = parseHex(encoded, 0);
	for (let position = 2; position < encoded.length; position += 2) {
		const byte = parseHex(encoded, position) ^ key;
		decoded += String.fromCharCode(byte);
	}
	return decoded;
};
//#endregion
//#region lib/routes/sciencedirect/journal.ts
const route = {
	path: "/journal/:id",
	categories: ["journal"],
	example: "/sciencedirect/journal/research-policy",
	parameters: { id: "Journal id, can be found in URL" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["sciencedirect.com/journal/:id", "sciencedirect.com/"] }],
	name: "Journal",
	maintainers: ["nczitzk"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const rootUrl = "https://www.sciencedirect.com";
	const currentUrl = `${rootUrl}/journal/${id}/articles-in-press`;
	const response = await got_default({
		method: "get",
		url: currentUrl
	});
	const list = (await got_default({
		method: "get",
		url: `${rootUrl}/journal/${response.data.match(/ISSN(\w{8})'/)[1]}/articles-in-press/articles?path=/journal/${id}/articles-in-press&title=${id}`,
		headers: { cookie: response.headers["set-cookie"].map((cookie) => cookie.split(";Version=1;", 1)[0]).join("; ") }
	})).data.data.results.map((item) => ({
		doi: item.doi,
		title: item.title,
		link: `${rootUrl}${item.href}`,
		pubDate: parseDate(item.coverDateStart),
		enclosure_url: `${rootUrl}${item.pdfDownload.url}`,
		author: item.authors.map((author) => `${author.givenName} ${author.surname}`).join(", ")
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		content("a.__cf_email__").each((_, e) => {
			e = content(e);
			e.after(decodeCFEmail(e.attr("data-cfemail")));
			e.remove();
		});
		item.description = (content(".Abstracts").html() ?? "") + (content(".Keywords").html() ?? "");
		return item;
	})));
	return {
		title: `${response.data.match(/\\"displayName\\":\\"(.*?)\\",\\"/)[1]} - ScienceDirect`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
