import { t as got_default } from "./got-Dnzt41dd.mjs";
import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/amazon/kindle-software-updates.tsx
const route = {
	path: "/kindle/software-updates",
	categories: ["program-update"],
	example: "/amazon/kindle/software-updates",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Kindle Software Updates",
	maintainers: ["EthanWng97"],
	handler
};
async function handler() {
	const url = "https://www.amazon.com/gp/help/customer/display.html";
	const nodeIdValue = "GKMQC26VQQMM8XSW";
	const data = (await got_default({
		method: "get",
		url,
		searchParams: { nodeId: nodeIdValue }
	})).data;
	const $ = load(data);
	const list = $(".a-row.cs-help-landing-section.help-display-cond").toArray().map((item) => {
		return {
			title: $(item).find(".sectiontitle").text(),
			link: $(item).find("a").eq(0).attr("href"),
			version: $(item).find("li").first().text(),
			website: `${url}?nodeId=${nodeIdValue}`,
			description: $(item).find(".a-column.a-span8").html().replaceAll(/[\t\n]/g, "")
		};
	});
	return {
		title: "Kindle E-Reader Software Updates",
		link: `${url}?nodeId=${nodeIdValue}`,
		description: "Kindle E-Reader Software Updates",
		item: list.map((item) => ({
			title: item.title + " - " + item.version,
			description: item.description + renderToString(/* @__PURE__ */ jsxs("div", { children: [
				/* @__PURE__ */ jsx("br", {}),
				/* @__PURE__ */ jsx("br", {}),
				/* @__PURE__ */ jsx("a", {
					href: item.website,
					children: "Kindle Website"
				})
			] })),
			guid: item.title + " - " + item.version,
			link: item.link
		}))
	};
}
//#endregion
export { route };
