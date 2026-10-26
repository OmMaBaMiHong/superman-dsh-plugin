import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/newzmz/templates/description.tsx
const renderDescription = ({ image, nameZh, nameEn, alias, update, links, categories, downLinks }) => {
	const alt = `${nameZh ?? ""}${nameEn ? ` - ${nameEn}` : ""}`;
	return renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [image ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
		src: image,
		alt
	}) }) : null, /* @__PURE__ */ jsx("table", { children: /* @__PURE__ */ jsxs("tbody", { children: [
		nameZh ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "中文名" }), /* @__PURE__ */ jsx("td", { children: nameZh })] }) : null,
		nameEn ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "英文名" }), /* @__PURE__ */ jsx("td", { children: nameEn })] }) : null,
		alias?.length ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "又名" }), /* @__PURE__ */ jsx("td", { children: alias.join(" / ") })] }) : null,
		update ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "更新频率" }), /* @__PURE__ */ jsx("td", { children: update })] }) : null,
		links?.length ? links.map((link) => /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: link.title }), /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("a", {
			href: link.link,
			children: link.link
		}) })] })) : null,
		categories?.length ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "标签" }), /* @__PURE__ */ jsx("td", { children: categories.join(" / ") })] }) : null,
		downLinks?.length ? downLinks.map((link) => /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: link.title }), /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("a", {
			href: link.link,
			children: link.link
		}) })] })) : null
	] }) })] }));
};
//#endregion
//#region lib/routes/newzmz/util.ts
const rootUrl = "https://nzmz.xyz";
/**
* Retrieve all movies and TV shows under a specified category on the homepage and obtain their detail links.
* @param {string} homeUrl      - Homepage URL
* @param {string} id           - Category id
* @param {string} modSelector  - Selector for mods
* @param {string} itemSelector - Selector for items
* @returns {Array} An array containing the links in the map.
*/
const getItems = async (homeUrl, id, modSelector, itemSelector) => {
	const $ = load(await cache_default.tryGet(homeUrl, async () => {
		const { data: response } = await got_default(homeUrl);
		return response;
	}));
	return $(modSelector).eq(Number(id)).find(itemSelector).toArray().map((item) => {
		item = $(item);
		return { link: new URL(item.prop("href"), rootUrl).href };
	});
};
/**
* Obtain the information corresponding to a given movie or TV show item based on the provided URL.
* @param {string} itemUrl  - Item URL
* @returns {Object} An object containing information of the item.
*/
const getItemInfo = (itemUrl) => cache_default.tryGet(`newzmz#${itemUrl.match(/details-(.*?)\.html/)[1]}`, async () => {
	const { data: detailResponse } = await got_default(itemUrl);
	const content = load(detailResponse);
	const nameZh = content("div.chsname").text();
	const nameEn = content("div.engname").text();
	const alias = content("div.aliasname").text().replace(/又名：/, "").split("/").map((a) => a.trim()).filter(Boolean);
	return {
		link: content("a.addgz").prop("href"),
		pubDate: parseDate(content("span.duration").first().text().match(/(\d{4}-\d{2}-\d{2})/)[1]),
		description: {
			image: content("div.details-bg img").prop("src"),
			nameZh,
			nameEn,
			alias,
			update: content("span.upday").text(),
			links: content("div.ep-infos a[title]").toArray().map((a) => {
				a = content(a);
				return {
					title: a.prop("title"),
					link: a.prop("href")
				};
			})
		},
		author: content("ul.sws-list").first().find("h5.title").toArray().map((a) => content(a).text()).join(" / "),
		category: [
			nameZh,
			nameEn,
			...alias
		]
	};
});
/**
* Retrieve all the episode items from the corresponding download page of a movie or TV show.
* @param {Object} i                - Preprocessed item object
* @param {string} downLinkType     - Type of download link, with the default value being `磁力链`. The website provides various types of download links, including but not limited to `磁力链`, `百度网盘`, `阿里云盘`, `夸克网盘`, `UC网盘`, and more. If the specified download link type cannot be found, the first download link will be returned instead.
* @param {string} itemSelector     - Selector for items
* @param {string} categorySelector - Selector for categories
* @param {string} downLinkSelector - Selector for download links
* @returns {Array} An array containing RSS feed objects in the map.
*/
const processItems = async (i, downLinkType, itemSelector, categorySelector, downLinkSelector) => {
	const { data: detailResponse } = await got_default(i.link);
	const content = load(detailResponse);
	return content(itemSelector).toArray().map((item) => {
		item = content(item);
		const categories = item.find(categorySelector).toArray().map((c) => content(c).text());
		const downLinks = item.find(downLinkSelector).toArray().map((downLink) => {
			downLink = content(downLink);
			return {
				title: downLink.find("p.link-name").text(),
				link: downLink.find("a[title]").prop("href")
			};
		});
		const subtitle = item.find("span.up").text().replaceAll(/[\s-]+/g, "");
		const title = `${i.description.nameZh || i.description.nameEn}|${subtitle}`;
		return {
			guid: `newzmz#${i.link.match(/view\/(.*?)\.html/)[1]}-${subtitle}`,
			title,
			link: i.link,
			description: renderDescription({
				...i.description,
				categories,
				downLinks
			}),
			author: i.author,
			category: [...i.category, ...categories].filter(Boolean),
			pubDate: i.pubDate,
			enclosure_url: downLinks.findLast((l) => l.title === downLinkType)?.link ?? downLinks[0].link,
			enclosure_type: "application/x-bittorrent"
		};
	});
};
//#endregion
//#region lib/routes/newzmz/index.ts
const route = {
	path: "/:id?/:downLinkType?",
	categories: ["multimedia"],
	example: "/newzmz/qEzRyY3v",
	parameters: {
		id: "剧集 id，可在剧集下载页 URL 中找到",
		downLinkType: "下载链接类型，默认为磁力链"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["newzmz.com/"],
		target: ""
	}],
	name: "指定剧集",
	maintainers: ["nczitzk"],
	handler,
	url: "newzmz.com/",
	description: `::: tip
[雪国列车 (剧版)](https://nzmz.xyz/details-qEzRyY3v.html) 的下载页 URL 为 \`https://v.ys99.xyz/view/qEzRyY3v.html\`，即剧集 id 为 \`qEzRyY3v\`
:::`
};
async function handler(ctx) {
	const { id = "1", downLinkType = "磁力链" } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 50;
	const isCategory = !Number.isNaN(id);
	const currentUrl = new URL(isCategory ? "index.html" : `details-${id}.html`, rootUrl).href;
	const $ = load(await cache_default.tryGet(currentUrl, async () => {
		const { data: response } = await got_default(currentUrl);
		return response;
	}));
	let items = isCategory ? await getItems(currentUrl, id, "div.rowMod", "ul.slides li a") : [{ link: currentUrl }];
	items = await Promise.all(items.slice(0, limit).map((item) => getItemInfo(item.link)));
	items = await Promise.all(items.filter((item) => item.link !== "#").map((i) => processItems(i, downLinkType, "div.team-con-area", "div.item-label a", "ul.team-icons li")));
	items = items.flat();
	const headerTitle = isCategory ? $("div.rowMod").eq(Number(id)).find("h2.row-header-title").text() : "";
	const title = `${$("title").text()}${headerTitle ? ` - ${headerTitle}` : ""}`;
	const icon = $("link[rel=\"shortcut icon\"]").prop("href");
	return {
		item: isCategory ? items : items.slice(0, limit),
		title,
		link: currentUrl,
		description: $("meta[name=\"description\"]").prop("content"),
		language: "zh-cn",
		image: $("img.logo-img").prop("src"),
		icon,
		logo: icon,
		subtitle: $("meta[name=\"keywords\"]").prop("content"),
		author: title,
		allowEmpty: true
	};
}
//#endregion
export { route };
