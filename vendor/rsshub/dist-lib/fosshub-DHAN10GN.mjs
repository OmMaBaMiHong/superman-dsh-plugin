import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/fosshub/index.tsx
const renderDescription = (links, changelog) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("table", { children: /* @__PURE__ */ jsx("tbody", { children: links?.map((link) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("tr", { children: link.map((item) => /* @__PURE__ */ jsx("th", { children: item.dt })) }), /* @__PURE__ */ jsx("tr", { children: link.map((item) => /* @__PURE__ */ jsx("td", { children: item.dd ? raw(item.dd) : null })) })] })) }) }), changelog ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("br", {}), raw(changelog)] }) : null] }));
const route = {
	path: "/:id",
	categories: ["program-update"],
	example: "/fosshub/qBittorrent",
	parameters: { id: "Software id, can be found in URL" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Software Update",
	maintainers: ["nczitzk"],
	handler
};
async function handler(ctx) {
	const currentUrl = `https://www.fosshub.com/${ctx.req.param("id") ?? ""}.html`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const version = $("dd[itemprop=\"softwareVersion\"]").first().text();
	const items = [{
		title: version,
		link: `${currentUrl}#${version}`,
		description: renderDescription($(".dwn-dl").toArray().map((l) => $(l).find(".w").toArray().map((w) => ({
			dt: $(w).find("dt").text(),
			dd: $(w).find("dd").html()
		}))), $("div[itemprop=\"releaseNotes\"]").html()),
		pubDate: parseDate($(".ma__upd .v").text(), "MMM DD, YYYY")
	}];
	return {
		title: `${$("#fh-ssd__hl").text()} - FossHub`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
