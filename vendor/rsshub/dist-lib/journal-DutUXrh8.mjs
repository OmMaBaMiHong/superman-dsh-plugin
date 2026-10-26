import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/aip/utils.tsx
const renderDesc = (title, authors, doi, img) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx("big", { children: title }) }), /* @__PURE__ */ jsx("br", {})] }), /* @__PURE__ */ jsxs("p", { children: [
	/* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx("small", { children: /* @__PURE__ */ jsx("i", { children: authors }) }) }),
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx("small", { children: /* @__PURE__ */ jsxs("i", { children: ["https://doi.org/", doi] }) }) }),
	/* @__PURE__ */ jsx("br", {}),
	img ? /* @__PURE__ */ jsx("img", { src: img }) : null
] })] }));
//#endregion
//#region lib/routes/aip/journal.ts
const route = {
	path: "/:pub/:jrn",
	categories: ["journal"],
	example: "/aip/aapt/ajp",
	parameters: {
		pub: "Publisher id",
		jrn: "Journal id"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: true
	},
	radar: [{ source: ["pubs.aip.org/:pub/:jrn"] }],
	name: "Journal",
	maintainers: ["Derekmini", "auto-bot-ty"],
	handler,
	description: `Refer to the URL format \`pubs.aip.org/:pub/:jrn\`

::: tip
More jounals can be found in [AIP Publications](https://publishing.aip.org/publications/find-the-right-journal).
:::`
};
async function handler(ctx) {
	const jrnlUrl = `https://pubs.aip.org/${ctx.req.param("pub")}/${ctx.req.param("jrn")}/issue`;
	const { data: response } = await got_default.get(jrnlUrl);
	const $ = load(response);
	return {
		title: $("meta[property=\"og:title\"]").attr("content").match(/(?:[^=]*=)?\s*([^>]+)/)[1],
		link: jrnlUrl,
		item: $(".al-article-item-wrap.al-normal").toArray().map((item) => {
			const title = $(item).find(".item-title a:first").text();
			const link = $(item).find(".item-title a:first").attr("href");
			const doilink = $(item).find(".citation-label a").attr("href");
			const doi = doilink && doilink.match(/10\.\d+\/\S+/)[0];
			const id = $(item).find("h5[data-resource-id-access]").data("resource-id-access");
			const authors = $(item).find(".al-authors-list").find("a").toArray().map((element) => $(element).text()).join("; ");
			const imgUrl = $(item).find(".issue-featured-image a img").attr("src");
			const img = imgUrl ? imgUrl.replace(/\?.+$/, "") : "";
			return {
				title,
				link,
				doilink,
				id,
				authors,
				img,
				doi,
				description: renderDesc(title, authors, doi, img)
			};
		}),
		allowEmpty: true
	};
}
//#endregion
export { route };
