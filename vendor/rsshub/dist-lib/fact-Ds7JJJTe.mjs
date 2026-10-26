import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
import CryptoJS from "crypto-js";
//#region lib/routes/qq/fact/index.tsx
const getRequestToken = () => {
	return CryptoJS.DES.encrypt(`${Date.now().toString()}-sgn51n6r6q97o6g3`, "jzhotdata").toString();
};
const baseUrl = "https://vp.fact.qq.com";
const route = {
	path: "/fact",
	categories: ["other"],
	example: "/qq/fact",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["vp.fact.qq.com/home", "vp.fact.qq.com/"] }],
	name: "最新辟谣",
	maintainers: ["hoilc"],
	handler,
	url: "vp.fact.qq.com/home"
};
async function handler() {
	const { data: response } = await got_default(`${baseUrl}/api/article/list`, {
		headers: { Referer: `${baseUrl}/home` },
		searchParams: {
			page: 1,
			locale: "zh-CN",
			token: getRequestToken()
		}
	});
	const list = response.data.list.map((item) => ({
		title: `【${item.explain}】${item.title}`,
		description: `<img src="${item.cover}"><br>${item.abstract}`,
		pubDate: parseDate(item.date, "YYYY-MM-DD"),
		author: `${item.Author.name} - ${item.Author.desc}`,
		category: item.tag,
		link: `${baseUrl}/article?id=${item.id}`
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default(item.link)).data);
		const { initialState } = JSON.parse($("#__NEXT_DATA__").text()).props.pageProps;
		item.description = renderToString(/* @__PURE__ */ jsx(QqFactDescription, { data: initialState }));
		item.pubDate = parseDate(initialState.createdAt);
		return item;
	})));
	return {
		title: "较真查证平台 - 腾讯新闻",
		link: `${baseUrl}/home`,
		item: items
	};
}
const QqFactDescription = ({ data }) => {
	const cover = data.cover?.startsWith("//") ? `https:${data.cover}` : data.cover?.startsWith("http") ? data.cover : data.cover ? `https://${data.cover}` : void 0;
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		cover ? /* @__PURE__ */ jsx("img", { src: cover }) : null,
		data.rumor ? /* @__PURE__ */ jsxs("div", {
			class: "saying",
			children: ["流传说法：", data.rumor]
		}) : null,
		data.abstract ? /* @__PURE__ */ jsxs(Fragment, { children: ["查证要点：", /* @__PURE__ */ jsx("ol", { children: data.abstract.map((item) => /* @__PURE__ */ jsx("li", { children: item.content })) })] }) : null,
		data.content ? /* @__PURE__ */ jsx("div", {
			class: "dangerouslySet",
			children: raw(data.content)
		}) : null
	] });
};
//#endregion
export { route };
