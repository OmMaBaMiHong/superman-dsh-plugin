import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/imiker/templates/description.tsx
const Description = ({ image, headImage, author, question, description }) => {
	const imageAlt = image?.height ?? image?.width ?? image?.alt;
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		image?.src ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
			src: image.src,
			alt: imageAlt
		}) }) : null,
		headImage ? /* @__PURE__ */ jsxs("figure", { children: [/* @__PURE__ */ jsx("img", { src: headImage }), author ? /* @__PURE__ */ jsx("figcaption", { children: author }) : null] }) : null,
		question ? /* @__PURE__ */ jsx("blockquote", { children: question }) : null,
		description ? /* @__PURE__ */ jsx(Fragment, { children: raw(description) }) : null
	] });
};
const renderDescription = (props) => renderToString(/* @__PURE__ */ jsx(Description, { ...props }));
//#endregion
//#region lib/routes/imiker/jinghua.ts
const route = {
	path: "/ask/jinghua",
	categories: ["new-media"],
	example: "/imiker/ask/jinghua",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["imiker.com/explore/find"] }],
	name: "米课圈精华",
	maintainers: ["nczitzk"],
	handler,
	url: "imiker.com/explore/find"
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 50;
	const rootUrl = "https://ask.imiker.com";
	const apiUrl = new URL("explore/main/list/", rootUrl).href;
	const currentUrl = new URL("", rootUrl).href;
	const { data: response } = await got_default(apiUrl, { searchParams: {
		page: 1,
		page_size: limit,
		type: "jinghua",
		types: "json"
	} });
	let items = response.slice(0, limit).map((item) => ({
		title: item.question_content,
		link: new URL(`question/${item.id}`, rootUrl).href,
		description: renderDescription({
			headImage: item.headimage,
			author: item.nick_name,
			question: item.question_detail
		}),
		author: item.nick_name,
		guid: `imiker-${item.id}`,
		pubDate: parseDate(item.add_time_timestamp * 1e3),
		upvotes: item.count?.vote_count ?? 0,
		comments: item.count?.answer_count ?? 0
	}));
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: detailResponse } = await got_default(item.link);
		const content = load(detailResponse);
		content("h5.img-for-lazyload").each((_, e) => {
			const image = content(e).find("img");
			content(e).replaceWith(renderDescription({ image: {
				src: image.prop("data-original"),
				alt: image.prop("alt"),
				width: image.prop("data-width"),
				height: image.prop("data-height")
			} }));
		});
		item.title = content("div.title h1").text();
		item.description += renderDescription({ description: content("div#warp").html() });
		item.author = content("div.name").text();
		return item;
	})));
	const author = "米课圈";
	const description = "精华";
	const icon = new URL("favicon.ico", rootUrl).href;
	return {
		item: items,
		title: `${author} - ${description}`,
		link: currentUrl,
		description,
		language: "zh",
		icon,
		logo: icon,
		subtitle: description,
		author,
		allowEmpty: true
	};
}
//#endregion
export { route };
