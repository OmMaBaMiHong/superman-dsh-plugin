import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import markdownit from "markdown-it";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/chuanliu/nice.tsx
const md = markdownit({ html: true });
const route = {
	path: "/nice",
	categories: ["blog"],
	example: "/chuanliu/nice",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["chuanliu.org/nice"] }],
	name: "严选",
	maintainers: ["nczitzk"],
	handler,
	url: "chuanliu.org/nice"
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 100;
	const rootUrl = "https://chuanliu.org";
	const apiRootUrl = "https://s.chuanliu.org";
	const currentUrl = new URL("nice/", rootUrl).href;
	const apiUrl = new URL("api/dis/api/v1/memo", apiRootUrl).href;
	const { data: response } = await got_default(apiUrl, { searchParams: {
		creatorId: 1,
		offset: 0,
		limit
	} });
	const items = response.slice(0, limit).map((item) => {
		const contents = item.content.split(/\n/);
		const category = contents?.[0].replace(/^#/, "") ?? void 0;
		const title = contents?.[1] ?? void 0;
		const link = contents?.[2] ?? void 0;
		const author = contents?.[3] ?? void 0;
		const isStar = (contents?.[5] && contents[5] === "star") ?? false;
		if (isStar) contents.splice(5, 1);
		return {
			title: `${isStar ? "[STAR] " : ""}${title}`,
			link,
			description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [item.resourceList.map((resource) => resource.externalLink ? /* @__PURE__ */ jsx("figure", { children: resource.filename ? /* @__PURE__ */ jsx("img", {
				src: resource.externalLink,
				alt: resource.filename
			}) : /* @__PURE__ */ jsx("img", { src: resource.externalLink }) }) : null), raw(md.render(contents?.join("\n\n") ?? ""))] })),
			author,
			category: [category, isStar ? "STAR" : void 0].filter(Boolean),
			guid: `chuanliu-nice#${item.id}`,
			pubDate: parseDate(item.createdTs, "X"),
			updated: parseDate(item.updatedTs, "X")
		};
	});
	const { data: currentResponse } = await got_default(currentUrl);
	const $ = load(currentResponse);
	const icon = new URL($("link[rel=\"shortcut icon\"]").prop("href"), currentUrl).href;
	return {
		item: items,
		title: $("title").text(),
		link: currentUrl,
		description: $("span.rainbow-text").first().text(),
		language: $("html").prop("lang"),
		icon,
		logo: icon,
		subtitle: $("title").text(),
		author: $("meta[name=\"author\"]").prop("content"),
		allowEmpty: true
	};
}
//#endregion
export { route };
