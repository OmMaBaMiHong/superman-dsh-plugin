import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/qq/ac/utils.tsx
const rootUrl = "https://ac.qq.com";
const mobileRootUrl = "https://m.ac.qq.com";
const ProcessItems = async (ctx, currentUrl, time, title) => {
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(`${time ? `.${time}-month-data ` : ""}.text-overflow`).slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 30).toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			guid: `${rootUrl}${item.attr("href")}`,
			link: `${mobileRootUrl}${item.attr("href").replace(/Comic\/ComicInfo/, "comic/index")}`
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.guid, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.link = item.guid;
		item.author = content(".author-wr").toArray().map((a) => $(a).text().trim()).join(", ");
		item.description = renderToString(/* @__PURE__ */ jsx(QqAcDescription, {
			image: content(".head-cover")?.attr("src") ?? "",
			description: content(".head-info-desc")?.text() ?? "",
			chapters: content(".reverse .bottom-chapter-item .chapter-link").toArray().map((chapter) => ({
				link: content(chapter).attr("href"),
				title: content(chapter).find(".comic-title")?.text() ?? "",
				image: content(chapter).find(".cover-image")?.attr("src") ?? ""
			}))
		}));
		return item;
	})));
	return {
		title: `${title} - 腾讯动漫`,
		link: currentUrl,
		item: items
	};
};
const QqAcDescription = ({ image, description, chapters }) => /* @__PURE__ */ jsxs(Fragment, { children: [
	image === "" ? null : /* @__PURE__ */ jsx("img", { src: image }),
	description === "" ? null : /* @__PURE__ */ jsx("p", { children: description }),
	chapters.map((chapter) => /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("img", { src: chapter.image }), /* @__PURE__ */ jsx("a", {
		href: chapter.link,
		children: chapter.title
	})] }))
] });
//#endregion
export { mobileRootUrl as n, rootUrl as r, ProcessItems as t };
