import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as renderDescription } from "./description-CVgPBJpb.mjs";
import { load } from "cheerio";
import { CookieJar } from "tough-cookie";
//#region lib/routes/elsevier/journal.ts
const cookieJar = new CookieJar();
const route = {
	path: ["/:journal/latest", "/:journal"],
	radar: [{
		source: ["www.sciencedirect.com/journal/:journal/*"],
		target: "/:journal"
	}],
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const journal = ctx.req.param("journal");
	const host = "https://www.sciencedirect.com";
	const jrnlUrl = `${host}/journal/${journal}`;
	const $ = load((await got_default(jrnlUrl, { cookieJar })).data);
	const jrnlName = $(".anchor.js-title-link").text();
	const issueUrl = `${host}${$(".link-anchor.u-clr-black").attr("href")}`;
	let issue = "";
	if (issueUrl.match("suppl") !== null) issue = "Volume " + issueUrl.match("vol/(.*)/suppl")[1];
	else if (issueUrl.match("issue") !== null) issue = "Volume " + issueUrl.match("vol/(.*)/issue")[1] + " Issue " + issueUrl.match("/issue/(.*)")[1];
	const $2 = load((await got_default(issueUrl, { cookieJar })).data);
	const list = $2(".js-article").toArray().map((item) => {
		const title = $2(item).find(".js-article-title").text();
		const authors = $2(item).find(".js-article__item__authors").text();
		return {
			title,
			link: $2(item).find(".article-content-title").attr("href"),
			id: $2(item).find(".article-content-title").attr("id"),
			authors,
			issue
		};
	});
	const renderDesc = (item) => renderDescription(item);
	return {
		title: jrnlName,
		link: jrnlUrl,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const $3 = load((await got_default(`${host}/science/article/pii/${item.id}`, { cookieJar })).data);
			$3(".section-title").remove();
			item.doi = $3(".doi").attr("href").replace("https://doi.org/", "");
			item.abstract = $3(".abstract.author").text();
			item.description = renderDesc(item);
			return item;
		})))
	};
}
//#endregion
export { route };
