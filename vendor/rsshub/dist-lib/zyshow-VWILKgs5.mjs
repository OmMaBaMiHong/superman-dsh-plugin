import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { r as getSubPath } from "./common-utils-xJr7JYuG.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/zyshow/index.tsx
const route = {
	path: "*",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const currentUrl = `http://www.zyshow.net${getSubPath(ctx).replace(/\/$/, "")}/`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const items = $("table").last().find("tr td a img.icon-play").toArray().map((item) => {
		item = $(item).parentsUntil("tbody");
		const a = item.find("a[title]").first();
		const guests = item.find("td").eq(2).text();
		return {
			title: a.text(),
			link: `${currentUrl}v/${a.attr("href").split("/v/").pop()}`,
			pubDate: parseDate(a.text().match(/(\d{8})$/)[1], "YYYYMMDD"),
			description: renderToString(/* @__PURE__ */ jsx(ZyshowDescription, {
				date: item.find("td").first().text(),
				subject: item.find("td").eq(1).text(),
				guests,
				link: `${currentUrl}v/${a.attr("href").split("/v/").pop()}`
			})),
			category: guests.split(/,|;/)
		};
	});
	return {
		title: `综艺秀 - ${$("h2").text()}`,
		link: currentUrl,
		item: items
	};
}
const ZyshowDescription = ({ link, date, subject, guests }) => /* @__PURE__ */ jsx("table", { children: /* @__PURE__ */ jsxs("tbody", { children: [
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "播出日期：" }), /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("b", { children: /* @__PURE__ */ jsx("a", {
		href: link,
		children: date
	}) }) })] }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "节目主题：" }), /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("b", { children: subject }) })] }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "节目来宾：" }), /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("b", { children: guests }) })] })
] }) });
//#endregion
export { route };
