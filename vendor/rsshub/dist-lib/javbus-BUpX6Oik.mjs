import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { r as getSubPath } from "./common-utils-xJr7JYuG.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/javbus/index.tsx
const toSize = (raw) => {
	const matches = raw.match(/(\d+(\.\d+)?)(\D\w*)/);
	return matches[3] === "GB" ? matches[1] * 1024 : matches[1];
};
const renderDescription = ({ info, magnets, thumbs }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	info ? raw(info) : null,
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsx("h4", { children: "磁力連結投稿" }),
	/* @__PURE__ */ jsxs("table", { children: [/* @__PURE__ */ jsxs("tr", { children: [
		/* @__PURE__ */ jsx("th", { children: "磁力名稱" }),
		/* @__PURE__ */ jsx("th", { children: "檔案大小" }),
		/* @__PURE__ */ jsx("th", { children: "分享日期" })
	] }), magnets?.map((magnet) => /* @__PURE__ */ jsxs("tr", { children: [
		/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("a", {
			href: magnet.link,
			children: magnet.title
		}) }),
		/* @__PURE__ */ jsx("td", { children: magnet.size }),
		/* @__PURE__ */ jsx("td", { children: magnet.date })
	] }))] }),
	/* @__PURE__ */ jsx("h4", { children: "樣品圖像" }),
	thumbs?.map((thumb) => /* @__PURE__ */ jsx("img", { src: thumb }))
] }));
const allowDomain = /* @__PURE__ */ new Set([
	"javbus.com",
	"javbus.org",
	"javsee.icu",
	"javsee.one"
]);
const route = {
	path: "/:path{.+}?",
	radar: [{
		source: ["www.javbus.com/:path*"],
		target: "/:path"
	}],
	name: "Works",
	maintainers: [
		"MegrezZhu",
		"CoderTonyChan",
		"nczitzk",
		"Felix2yu"
	],
	categories: ["multimedia"],
	view: 3,
	handler,
	url: "www.javbus.com",
	example: "/javbus/star/rwt",
	parameters: { path: { description: "Any path of list page on javbus" } },
	features: { nsfw: true }
};
async function handler(ctx) {
	const isWestern = getSubPath(ctx).startsWith("/western");
	const domain = ctx.req.query("domain") ?? "javbus.com";
	const westernDomain = ctx.req.query("western_domain") ?? "javbus.org";
	const rootUrl = `https://www.${domain}`;
	const westernUrl = `https://www.${westernDomain}`;
	if (!config.feature.allow_user_supply_unsafe_domain && (!allowDomain.has(new URL(`https://${domain}/`).hostname) || !allowDomain.has(new URL(`https://${westernDomain}/`).hostname))) throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
	const currentUrl = `${isWestern ? westernUrl : rootUrl}${getSubPath(ctx).replace(/^\/western/, "").replace(/\/home/, "")}`;
	const headers = { "accept-language": "zh-CN" };
	const $ = load((await got_default({
		method: "get",
		url: currentUrl,
		headers
	})).data);
	let items = $(".movie-box").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 50).toArray().map((item) => {
		item = $(item);
		return {
			link: item.attr("href"),
			guid: item.find("date").first().text(),
			pubDate: parseDate(item.find("date").last().text())
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const detailResponse = await got_default({
			method: "get",
			url: item.link,
			headers
		});
		const content = load(detailResponse.data);
		content(".genre").last().parent().remove();
		content("input[type=\"checkbox\"], button").remove();
		const stars = content(".avatar-box span").toArray().map((s) => content(s).text());
		const cacheIn = {
			author: stars.join(", "),
			title: content("h3").text(),
			category: [...content(".genre label").toArray().map((c) => content(c).text()), ...stars],
			info: content(".row.movie").html(),
			thumbs: content(".sample-box").toArray().map((i) => {
				const thumbSrc = content(i).attr("href");
				return thumbSrc.startsWith("http") ? thumbSrc : `${rootUrl}${thumbSrc}`;
			})
		};
		let magnets;
		try {
			const matches = detailResponse.data.match(/var gid = (\d+);[\s\S]*var uc = (\d+);[\s\S]*var img = '(.*)';/);
			const content = load(`<table>${(await got_default({
				method: "get",
				url: `${rootUrl}/ajax/uncledatoolsbyajax.php`,
				searchParams: {
					gid: matches[1],
					lang: "zh",
					img: matches[3],
					uc: matches[2],
					floor: 800
				},
				headers: { Referer: item.link }
			})).data}</table>`);
			magnets = content("tr").toArray().map((tr) => {
				const td = content(tr).find("a[href]");
				return {
					title: td.first().text().trim(),
					link: td.first().attr("href"),
					size: td.eq(1).text().trim(),
					date: td.last().text().trim(),
					score: content(tr).find("a").length ** 8 * toSize(td.eq(1).text().trim())
				};
			});
			if (magnets) {
				item.enclosure_url = magnets.toSorted((a, b) => b.score - a.score)[0].link;
				item.enclosure_type = "application/x-bittorrent";
			}
		} catch {}
		item.author = cacheIn.author;
		item.title = cacheIn.title;
		item.category = cacheIn.category;
		item.description = renderDescription({
			info: cacheIn.info,
			thumbs: cacheIn.thumbs,
			magnets
		});
		return item;
	})));
	const title = $("head title").text();
	return {
		title: `${title.startsWith("JavBus") ? "" : "JavBus - "}${title.replace(/ - AV磁力連結分享/, "")}`,
		link: currentUrl,
		item: items,
		allowEmpty: true
	};
}
//#endregion
export { route };
