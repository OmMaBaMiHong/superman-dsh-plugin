import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/nhk/news-web-easy.tsx
const route = {
	path: "/news_web_easy",
	categories: ["traditional-media"],
	example: "/nhk/news_web_easy",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["news.web.nhk/news/easy/", "news.web.nhk/"] }],
	name: "News Web Easy",
	maintainers: ["Andiedie"],
	handler,
	url: "news.web.nhk/news/easy/"
};
async function handler(ctx) {
	const buildAuthorizeResponse = await rofetch.raw("https://news.web.nhk/tix/build_authorize", {
		query: {
			idp: "a-alaz",
			profileType: "abroad",
			redirect_uri: "https://news.web.nhk/news/easy/",
			entity: "none",
			area: "130",
			pref: "13",
			jisx0402: "13101",
			postal: "1000001"
		},
		redirect: "manual"
	});
	const buildAuthorizeCookie = buildAuthorizeResponse.headers.getSetCookie().map((c) => c.split(";", 1)[0]).join("; ");
	const authorizeResponse = await rofetch.raw(buildAuthorizeResponse.headers.get("location"), { redirect: "manual" });
	const idpCookie = (await rofetch.raw(authorizeResponse.headers.get("location"), {
		headers: { cookie: buildAuthorizeCookie },
		redirect: "manual"
	})).headers.getSetCookie().map((c) => c.split(";", 1)[0]).join("; ");
	const dates = (await rofetch("https://news.web.nhk/news/easy/news-list.json", { headers: { cookie: buildAuthorizeCookie + "; " + idpCookie } }))[0];
	let items = Object.values(dates).flatMap((articles) => articles.map((article) => ({
		title: article.title,
		description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
			article.title_with_ruby ? /* @__PURE__ */ jsx("h1", { children: raw(article.title_with_ruby) }) : null,
			article.news_web_image_uri ? /* @__PURE__ */ jsx("img", { src: article.news_web_image_uri }) : null,
			/* @__PURE__ */ jsx("br", {})
		] })),
		guid: article.news_id,
		pubDate: timezone(parseDate(article.news_prearranged_time), 9),
		link: `https://news.web.nhk/news/easy/${article.news_id}/${article.news_id}.html`
	})));
	items = items.toSorted((a, b) => b.pubDate - a.pubDate).slice(0, ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 30);
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load(await rofetch(item.link, { headers: { cookie: buildAuthorizeCookie + "; " + idpCookie } }));
		item.description += $(".article-body").html();
		return item;
	})));
	return {
		title: "NEWS WEB EASY",
		link: "https://news.web.nhk/news/easy/",
		description: "NEWS WEB EASYは、小学生・中学生の皆さんや、日本に住んでいる外国人のみなさんに、わかりやすいことば　でニュースを伝えるウェブサイトです。",
		item: items
	};
}
//#endregion
export { route };
