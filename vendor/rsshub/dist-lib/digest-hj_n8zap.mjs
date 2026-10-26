import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/saraba1st/digest.tsx
const route = {
	path: "/digest/:tid",
	categories: ["bbs"],
	example: "/saraba1st/digest/forum-6-1",
	parameters: { tid: "论坛 id" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "论坛摘要",
	maintainers: ["shinemoon"],
	handler,
	description: "版面网址如果为 `https://stage1st.com/2b/forum-6-1.html` 那么论坛 id 就是 `forum-6-1`。"
};
async function handler(ctx) {
	const tid = ctx.req.param("tid");
	const cookieString = config.saraba1st.cookie ?? "";
	const host = config.saraba1st.host;
	const $ = load((await got_default(`${host}/2b/${tid}.html`, { headers: { Cookie: cookieString } })).data);
	const title = $("head title").text().replace(/-.*/, "");
	const count = $("#threadlisttableid tbody[id^=\"normalthread_\"] tr").slice(0, ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 20).toArray().map((each) => {
		each = $(each);
		const floor = each.find("th.new a.s.xst").text();
		const floorUrl = each.find("th.new a.s.xst").attr("href");
		return {
			title: `${title}:${floor}`,
			link: new URL(floorUrl, `${host}/2b/`).href,
			author: each.find("td.by cite").text(),
			pubDate: timezone(parseDate(each.find("td.by em").first().text()), 8)
		};
	});
	const resultItems = await Promise.all(count.map((i) => cache_default.tryGet(i.link, async () => {
		i.description = await fetchContent(i.link);
		return i;
	})));
	return {
		title: `Stage1 论坛 - ${title}`,
		link: `${host}/2b/${tid}.html`,
		item: resultItems
	};
}
async function fetchContent(url) {
	const subind = load((await got_default(url, { headers: { Cookie: config.saraba1st.cookie ?? "" } })).data);
	const stubS = subind("<div>");
	subind("#postlist").find("div[id*=\"post_\"] ").each((_, el) => {
		if (!subind(el).find("td[id*=\"postmessage_\"]").length) return;
		const section = renderToString(/* @__PURE__ */ jsx(DigestSection, {
			author: {
				link: subind(el).find(".pls.favatar div.authi a").attr("href"),
				name: subind(el).find(".pls.favatar div.authi").text(),
				postinfo: subind(el).find("div.authi em[id*=authorposton]").text()
			},
			msg: subind(el).find("td[id*=\"postmessage_\"]").html(),
			host: config.saraba1st.host
		}));
		stubS.append(section);
	});
	stubS.find("img").each((_, el) => {
		const img = subind(el);
		const file = img.attr("file");
		if (file) {
			img.attr("src", file);
			img.removeAttr("zoomfile");
			img.removeAttr("file");
			img.removeAttr("onmouseover");
			img.removeAttr("onclick");
		}
	});
	return stubS.html();
}
const DigestSection = ({ author, msg, host }) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("div", {
	class: "quoted",
	style: "background:rgba(220,220,220,0.3);",
	children: [/* @__PURE__ */ jsx("a", {
		style: "text-decoration: none;",
		href: `${host}/2b/${author.link ?? ""}`,
		children: author.name
	}), /* @__PURE__ */ jsx("span", {
		style: "text-decoration: none;color:#aaa;",
		children: author.postinfo
	})]
}), /* @__PURE__ */ jsx("div", {
	class: "content",
	style: "margin-bottom:20px!important;",
	children: msg ? raw(msg) : null
})] });
//#endregion
export { route };
