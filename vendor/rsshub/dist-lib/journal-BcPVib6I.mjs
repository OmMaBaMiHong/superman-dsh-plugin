import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { CookieJar } from "tough-cookie";
//#region lib/routes/mdpi/journal.tsx
const cookieJar = new CookieJar();
const route = {
	path: "/:journal",
	categories: ["journal"],
	example: "/mdpi/analytica",
	parameters: { journal: "Journal Name, get it from the journal homepage" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.mdpi.com/journal/:journal"] }],
	name: "Journal",
	maintainers: ["Derekmini"],
	handler
};
async function handler(ctx) {
	const journal = ctx.req.param("journal");
	const host = "https://www.mdpi.com";
	const jrnlUrl = `${host}/journal/${journal}`;
	const $ = load((await got_default(jrnlUrl, { cookieJar })).data);
	const jrnlName = $(".journal__description").find("h1").text();
	const $2 = load((await got_default(`${host}${$(".side-menu-ul").find("a").eq(1).attr("href")}`, { cookieJar })).data);
	const issue = $2(".content__container").find("h1").text().trim();
	const list = $2(".article-item").toArray().map((item) => {
		const title = $2(item).find(".title-link").text();
		const link = `${host}${$2(item).find(".title-link").attr("href")}`;
		const authors = $2(item).find(".authors").find(".inlineblock").text();
		const doiLink = $2(item).find(".color-grey-dark").find("a").attr("href");
		let doi = "";
		if (doiLink !== void 0) doi = doiLink.replace("https://doi.org/", "");
		$2(item).find(".abstract-full").find("a").remove();
		const abstract = $2(item).find(".abstract-full").text().trim();
		const img = `${host}${$2(item).find(".openpopupgallery").find("img").attr("data-src")}`;
		return {
			title,
			authors,
			link,
			doi,
			abstract,
			issue,
			img
		};
	});
	const renderDesc = (item) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx("big", { children: item.title }) }), /* @__PURE__ */ jsx("br", {})] }),
		/* @__PURE__ */ jsxs("p", { children: [
			/* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx("small", { children: /* @__PURE__ */ jsx("i", { children: item.authors }) }) }),
			/* @__PURE__ */ jsx("br", {}),
			/* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx("small", { children: /* @__PURE__ */ jsx("i", { children: `https://doi.org/${item.doi}` }) }) }),
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
		item: list.map((item) => {
			item.description = renderDesc(item);
			return item;
		})
	};
}
//#endregion
export { route };
