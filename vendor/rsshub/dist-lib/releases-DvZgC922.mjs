import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/tiddlywiki/releases.ts
const route = {
	path: "/releases",
	categories: ["program-update"],
	example: "/tiddlywiki/releases",
	url: "tiddlywiki.com",
	name: "Releases",
	maintainers: ["p3psi-boo"],
	radar: [{
		source: ["github.com/TiddlyWiki/TiddlyWiki5"],
		target: "/releases"
	}, {
		source: ["tiddlywiki.com"],
		target: "/releases"
	}],
	handler
};
async function handler() {
	const $ = load((await got_default({
		method: "get",
		url: "https://github.com/TiddlyWiki/TiddlyWiki5/releases.atom"
	})).data);
	const versionList = $("entry").toArray().map((item) => {
		item = $(item);
		const text = item.find("title").text();
		const date = item.find("updated").text();
		return {
			version: text.match(/v\d+\.\d+\.\d+/)?.[0],
			pubDate: parseDate(date)
		};
	}).filter((item) => item.version);
	return {
		title: "TiddlyWiki Releases",
		link: "https://tiddlywiki.com/static/Releases.html",
		item: await Promise.all(versionList.map((item) => {
			const url = `https://tiddlywiki.com/static/Release%2520${item.version.slice(1)}.html`;
			return cache_default.tryGet(url, async () => {
				const description = load((await got_default({
					method: "get",
					url
				})).data)(".tc-tiddler-body").html();
				return {
					title: item.version,
					link: url,
					pubDate: item.pubDate,
					description
				};
			});
		}))
	};
}
//#endregion
export { route };
