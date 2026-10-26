import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/springer/journal.tsx
const route = {
	path: "/journal/:journal",
	categories: ["journal"],
	example: "/springer/journal/10450",
	parameters: { journal: "Journal Code, the number in the URL from the journal homepage" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.springer.com/journal/:journal/*"] }],
	name: "Journal",
	maintainers: [
		"Derekmini",
		"TonyRL",
		"xiahaoyun"
	],
	handler
};
async function handler(ctx) {
	const host = "https://link.springer.com";
	const jrnlUrl = `${host}/journal/${ctx.req.param("journal")}/volumes-and-issues`;
	const authorizeResponse = await rofetch.raw("https://idp.springer.com/authorize", {
		query: {
			response_type: "cookie",
			client_id: "springerlink",
			redirect_uri: jrnlUrl
		},
		redirect: "manual"
	});
	const authorizeCookie = authorizeResponse.headers.getSetCookie().map((c) => c.split(";", 1)[0]).join("; ");
	await rofetch(authorizeResponse.headers.get("location"), {
		headers: { cookie: authorizeCookie },
		redirect: "manual"
	});
	const $ = load(await rofetch(jrnlUrl, { headers: { cookie: authorizeCookie } }));
	const jrnlName = $("span.app-journal-masthead__title").text().trim();
	const $2 = load(await rofetch(`${host}${$("li.c-list-group__item:first-of-type").find("a").attr("href")}`, { headers: { cookie: authorizeCookie } }));
	const issue = $2("h2.app-journal-latest-issue__heading").text();
	const list = $2("ol.u-list-reset > li").toArray().map((item) => {
		const title = $(item).find("h3.app-card-open__heading").find("a").text().trim();
		const link = $(item).find("h3.app-card-open__heading").find("a").attr("href");
		const doi = link.replace("https://link.springer.com/article/", "");
		const img = $(item).find("img").attr("src");
		const authors = $(item).find("li").toArray().map((item) => $(item).text().trim()).join("; ");
		return {
			title,
			link: link.startsWith("http") ? link : `${host}${link}`,
			doi,
			issue,
			img,
			authors
		};
	});
	const renderDesc = (item) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx("big", { children: item.title }) }), /* @__PURE__ */ jsx("br", {})] }),
		/* @__PURE__ */ jsxs("p", { children: [
			/* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx("small", { children: /* @__PURE__ */ jsx("i", { children: item.authors }) }) }),
			/* @__PURE__ */ jsx("br", {}),
			/* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx("small", { children: /* @__PURE__ */ jsxs("i", { children: ["https://doi.org/", item.doi] }) }) }),
			/* @__PURE__ */ jsx("br", {}),
			/* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx("small", { children: /* @__PURE__ */ jsx("i", { children: item.issue }) }) }),
			/* @__PURE__ */ jsx("br", {}),
			/* @__PURE__ */ jsx("img", { src: item.img })
		] }),
		/* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("span", { children: item.abstract }), /* @__PURE__ */ jsx("br", {})] })
	] }));
	return {
		title: jrnlName,
		link: jrnlUrl,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			item.abstract = load(await rofetch(item.link, { headers: { cookie: authorizeCookie } }))("div#Abs1-content > p:first-of-type").text();
			item.description = renderDesc(item);
			return item;
		})))
	};
}
//#endregion
export { route };
