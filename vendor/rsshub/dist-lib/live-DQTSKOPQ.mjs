import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/pts/templates/live.tsx
const renderLive = ({ images, texts }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [images.map((image) => /* @__PURE__ */ jsx("img", { src: image })), texts.map((text) => /* @__PURE__ */ jsx(Fragment, { children: raw(text) }))] }));
//#endregion
//#region lib/routes/pts/live.ts
const route = {
	path: "/live/:id",
	categories: ["traditional-media"],
	example: "/pts/live/62e8e4bbb4de2cbd74468b2b",
	parameters: { id: "報導 id，可在对应整理報導页 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["news.pts.org.tw/live/:id", "news.pts.org.tw/"] }],
	name: "整理報導",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const rootUrl = "https://news.pts.org.tw";
	const currentUrl = `${rootUrl}/live/${id}`;
	const apiUrl = `${rootUrl}/live/api/liveblog/${id}`;
	const imageRootUrl = "https://dkjm35kkdt2ag.cloudfront.net";
	const response = await got_default({
		method: "get",
		url: apiUrl
	});
	let items = response.data.data.blogArticleList.slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 30).map((item) => ({ link: `${rootUrl}/live/api/liveblog/article?articleId=${item}&model=main` }));
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const data = (await got_default({
			method: "get",
			url: item.link
		})).data.data;
		item.title = data.title;
		item.pubDate = parseDate(data.updatedDate);
		item.description = renderLive({
			images: data.content.filter((d) => d.type === "img").map((i) => `${imageRootUrl}/${i.imgFileUrl}`),
			texts: data.content.filter((d) => d.type === "text").map((t) => t.content)
		});
		return item;
	})));
	return {
		title: `公視新聞網 PNN - ${response.data.data.title.replace(/【不斷更新】/, "")}`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
