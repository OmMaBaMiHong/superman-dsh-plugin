import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as md5 } from "./md5-CpIHIxCO.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/4ksj/forum.tsx
const renderDescription = ({ images, title, keys, details, description, info, links }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	images?.map((image) => image?.src ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
		src: image.src,
		alt: image.alt ?? void 0
	}) }) : null),
	title ? /* @__PURE__ */ jsx("h1", { children: title }) : null,
	keys && details ? /* @__PURE__ */ jsx("table", { children: /* @__PURE__ */ jsx("tbody", { children: keys.map((key) => /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: key }), /* @__PURE__ */ jsx("td", { children: details[key] })] })) }) }) : null,
	description ? /* @__PURE__ */ jsx("p", { children: description }) : null,
	info ? /* @__PURE__ */ jsx("blockquote", { children: raw(info) }) : null,
	links ? /* @__PURE__ */ jsx("table", { children: /* @__PURE__ */ jsx("tbody", { children: links.map((link) => /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("a", {
		href: link.link,
		children: link.title
	}) }), /* @__PURE__ */ jsx("td", { children: link.tags?.join("") ?? "" })] })) }) }) : null
] }));
const route = {
	path: "/:id?",
	name: "分类",
	url: "4ksj.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/4ksj/4k-uhd-1",
	parameters: { id: "分类 id，默认为最新4K电影" },
	description: `::: tip
若订阅 [最新 4K 电影](https://www.4ksj.com/4k-uhd-1.html)，网址为 \`https://www.4ksj.com/4k-uhd-1.html\`。截取 \`https://www.4ksj.com/\` 到末尾 \`.html\` 的部分 \`4k-uhd-1\` 作为参数，此时路由为 [\`/4ksj/4k-uhd-1\`](https://rsshub.app/4ksj/4k-uhd-1)。

若订阅子分类 [Dolby Vision 动作 4K 电影](https://www.4ksj.com/4k-uhd-s7-display-3-dytypes-1-1.html)，网址为 \`https://www.4ksj.com/4k-uhd-s7-display-3-dytypes-1-1.html\`。截取 \`https://www.4ksj.com/forum-\` 到末尾 \`.html\` 的部分 \`4kdianying-s7-dianyingbiaozhun-3-dytypes-9-1\` 作为参数，此时路由为 [\`/4ksj/4k-uhd-s7-display-3-dytypes-1-1\`](https://rsshub.app/4ksj/4k-uhd-s7-display-3-dytypes-1-1)。
:::`,
	categories: ["multimedia"]
};
function stringtoHex(acSTR) {
	let val = "";
	for (let i = 0; i <= acSTR.length - 1; i++) {
		const code = acSTR.charAt(i).codePointAt();
		val += code;
	}
	return val;
}
async function handler(ctx) {
	const { id = "4k-uhd-1" } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 25;
	const rootUrl = "https://www.4ksj.com";
	const currentUrl = new URL(`${id}.html`, rootUrl).href;
	const response = await rofetch(currentUrl, { responseType: "arrayBuffer" });
	const decoder = new TextDecoder("gbk");
	const $ = load(decoder.decode(response));
	const language = "zh";
	const image = $("div.nexlogo img").prop("src");
	let items = $("div.nex_cmo_piv a").slice(0, limit).toArray().map((item) => {
		item = $(item);
		return { link: new URL(item.prop("href"), rootUrl).href };
	});
	const getCookie = () => cache_default.tryGet("4ksj:cookie", async () => {
		const scriptPath = load(await rofetch(items[0].link))("script").attr("src");
		const scriptUrl = new URL(scriptPath, rootUrl).href;
		const scriptResponse = await rofetch(scriptUrl);
		const key = scriptResponse.match(/\{var key="(.*?)"/)?.[1];
		const value = scriptResponse.match(/",value="(.*?)"/)?.[1];
		const getPath = scriptResponse.match(/\.get\("(.*?&key=)"/)?.[1];
		if (!key || !value || !getPath) throw new Error("Failed to get cookie");
		return (await rofetch.raw(`${rootUrl}${getPath}${key}&value=${md5(stringtoHex(value))}`)).headers.getSetCookie().map((c) => c.split(";", 1)[0]).join("; ");
	});
	const cookie = await getCookie();
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const detailResponse = await rofetch(item.link, {
			responseType: "arrayBuffer",
			headers: { Cookie: cookie }
		});
		const $$ = load(decoder.decode(detailResponse));
		$$("div.nex_drama_intros em").first().remove();
		$$("strong font").each((_, el) => {
			el = $$(el);
			el.parent().remove();
		});
		const title = $$("div.nex_drama_Top h5").text();
		const description = $$("div.nex_drama_intros").html();
		const picture = $$("div.nex_drama_pic").html().match(/background:url\((.*?)\)/)?.[1] ?? "";
		const details = $$("li.nex_drama_Detail_li, li.nex_drama_Detail_lis dd").toArray().map((li) => {
			li = $$(li);
			const key = li.find("em").text().replaceAll(/：|\s/g, "");
			const value = li.find("span").length === 0 ? li.contents().last().text().trim() : li.find("span").text().trim();
			return { [key]: value };
		});
		const mergedDetails = Object.assign({}, ...details);
		const links = $$("td.t_f ignore_js_op").length === 0 ? $$("td.t_f strong").toArray().map((l) => {
			l = $$(l);
			const title = l.contents().first().text();
			const link = l.next().prop("href") ?? l.nextUntil("a").next().prop("href");
			item.enclosure_url ??= link;
			item.enclosure_type ??= "application/x-bittorrent";
			item.enclosure_title ??= title;
			return {
				title,
				tags: l.contents().last().text().match(/【(.*?)】/g),
				link
			};
		}) : $$("div.newfujian").toArray().map((l) => {
			l = $$(l);
			return {
				title: l.find("p.filename").prop("title") || l.find("p.filename").text(),
				tags: l.find("div.fileaq").text().match(/【(.*?)】/g),
				link: l.find("div.down_2 a").prop("href")
			};
		});
		const pubDateEl = $$("table.boxtable em").first();
		const pubDate = pubDateEl.find("span[title]").length === 0 ? pubDateEl.first().text().replace(/发表于\s/, "") : pubDateEl.find("span[title]").prop("title");
		item.title = title;
		item.description = renderDescription({
			images: picture ? [{
				src: picture,
				alt: title
			}] : void 0,
			title,
			keys: Object.keys(mergedDetails),
			details: mergedDetails,
			description,
			info: $$("div.nex_drama_sums").html(),
			links
		});
		item.pubDate = timezone(parseDate(pubDate, "YYYY-M-D HH:mm:ss"), 8);
		item.category = Object.values(mergedDetails).flatMap((c) => c.split(/\s/)).filter(Boolean);
		item.author = mergedDetails["导演"];
		item.content = {
			html: description,
			text: $$("div.nex_drama_intros").text()
		};
		item.image = picture;
		item.banner = picture;
		item.language = language;
		return item;
	})));
	return {
		title: `4k世界 - ${$("#fontsearch ul.cl li.a").toArray().map((a) => $(a).text()).join("+") || "不限"}`,
		description: $("meta[name=\"description\"]").prop("content"),
		link: currentUrl,
		item: items,
		allowEmpty: true,
		image,
		author: $("meta[name=\"application-name\"]").prop("content"),
		language
	};
}
//#endregion
export { route };
