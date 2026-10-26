import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as renderDescription } from "./description-CVgPBJpb.mjs";
import { load } from "cheerio";
import { CookieJar } from "tough-cookie";
//#region lib/routes/elsevier/issue.ts
const cookieJar = new CookieJar();
const route = {
	path: ["/:journal/vol/:issue", "/:journal/:issue"],
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
	const issue = "Volume " + ctx.req.param("issue").replace("-", " Issue ");
	const host = "https://www.sciencedirect.com";
	const issueUrl = `${host}/journal/${journal}/vol/${ctx.req.param("issue").replace("-", "/issue/")}`;
	const $ = load((await got_default(issueUrl, { cookieJar })).data);
	const jrnlName = $(".anchor.js-title-link").text();
	const list = $(".js-article").toArray().map((item) => {
		const title = $(item).find(".js-article-title").text();
		const authors = $(item).find(".js-article__item__authors").text();
		return {
			title,
			link: $(item).find(".article-content-title").attr("href"),
			id: $(item).find(".article-content-title").attr("id"),
			authors,
			issue
		};
	});
	const renderDesc = (item) => renderDescription(item);
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $2 = load((await got_default(`${host}/science/article/pii/${item.id}`, { cookieJar })).data);
		$2(".section-title").remove();
		item.doi = $2(".doi").attr("href").replace("https://doi.org/", "");
		item.abstract = $2(".abstract.author").text();
		item.description = renderDesc(item);
		return item;
	})));
	return {
		title: `${jrnlName} - ${issue}`,
		link: issueUrl,
		item: items
	};
}
//#endregion
export { route };
