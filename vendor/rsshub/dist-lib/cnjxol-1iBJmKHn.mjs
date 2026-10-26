import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { Fragment, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/cnjxol/index.tsx
const categories = {
	jxrb: "嘉兴日报",
	nhwb: "南湖晚报"
};
const route = {
	path: "/:category?/:id?",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "jxrb";
	const id = ctx.req.param("id");
	if (!Object.keys(categories).includes(category)) throw new InvalidParameterError("Invalid category");
	const currentUrl = `${`https://${category}.cnjxol.com`}/${category}Paper/pc/layout`;
	let $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const dateMatch = $("a").first().attr("href").match(/\d{6}\/\d{2}/)[0];
	let items = [];
	if (id) {
		$ = load((await got_default({
			method: "get",
			url: `${currentUrl}/${dateMatch}/node_${id}.html`
		})).data);
		items = $("#articlelist .clearfix a").toArray().map((a) => `${currentUrl}/${$(a).attr("href")}`.replaceAll("layout/../../../", ""));
	} else await Promise.all($("#list li a").toArray().map(async (p) => {
		const page = load((await got_default({
			method: "get",
			url: `${currentUrl}/${$(p).attr("href")}`
		})).data);
		items.push(...page("#articlelist .clearfix a").toArray().map((a) => `${currentUrl}/${page(a).attr("href")}`.replaceAll("layout/../../../", "")));
	}));
	items = await Promise.all(items.map((item) => cache_default.tryGet(item, async () => {
		const content = load((await got_default({
			method: "get",
			url: item
		})).data);
		const attachment = content(".attachment").html();
		const contentHtml = content("founder-content").html();
		return {
			link: item,
			title: content("#Title").text(),
			pubDate: parseDate(content("date").text()),
			description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [attachment ? raw(attachment) : null, contentHtml ? raw(contentHtml) : null] }))
		};
	})));
	return {
		title: `${categories[category]}${id ? ` - ${$("#layout").text()}` : ""}`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
