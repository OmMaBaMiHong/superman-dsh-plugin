import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/ycwb/index.tsx
const route = {
	path: "/:node",
	categories: ["traditional-media"],
	example: "/ycwb/1",
	parameters: { node: "栏目 id" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "新闻",
	maintainers: ["TimWu007"],
	handler,
	description: `注：小部分栏目的 URL 会给出 nodeid。如未给出，可打开某条新闻链接后，查看网页源代码，搜索 nodeid 的值。

常用栏目节点：

| 首页 | 中国 | 国际 | 体育 | 要闻 | 珠江评论 | 民生观察 | 房产 | 金羊教育 | 金羊财富 | 金羊文化 | 金羊健康 | 金羊汽车 |
| ---- | ---- | ---- | ---- | ---- | -------- | -------- | ---- | -------- | -------- | -------- | -------- | -------- |
| 1    | 14   | 15   | 16   | 22   | 1875     | 21773    | 222  | 5725     | 633      | 5281     | 21692    | 223      |

| 广州 | 广州 - 广州要闻 | 广州 - 社会百态 | 广州 - 深读广州 | 广州 - 生活服务 | 今日大湾区 | 广东 - 政经热闻 | 广东 - 民生视点 | 广东 - 滚动新闻 |
| ---- | --------------- | --------------- | --------------- | --------------- | ---------- | --------------- | --------------- | --------------- |
| 18   | 5261            | 6030            | 13352           | 83422           | 100418     | 13074           | 12252           | 12212           |`
};
async function handler(ctx) {
	const { data: response } = await got_default(`https://6api.ycwb.com/app_if/jy/getArticles?nodeid=${ctx.req.param("node") ?? 1}&pagesize=15`);
	const list = response.artiles.map((item) => ({
		title: item.TITLE,
		description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [item.PICLINKS ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: item.PICLINKS }), /* @__PURE__ */ jsx("br", {})] }) : null, item.ABSTRACT ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("blockquote", { children: /* @__PURE__ */ jsx("p", { children: item.ABSTRACT }) }), /* @__PURE__ */ jsx("br", {})] }) : null] })),
		pubDate: timezone(parseDate(item.PUBTIME), 8),
		link: item.PUBURL,
		nodeName: item.NODENAME
	}));
	let nodeName = "";
	let nodeLink = "";
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		content(".main_article").contents().filter((_, el) => el.nodeType === 8).each((_, el) => {
			if (/audioPlayer|audio-box/.test(el.data)) el.data = "";
			if (/author/.test(el.data)) item.author = el.data.split("<author>", 2)[1].split("</author>", 1)[0];
		});
		nodeName = nodeName === "" ? item.nodeName : nodeName;
		const children = content(".path").children("a");
		for (const child of children) if (content(child).text() === nodeName && nodeLink === "") nodeLink = content(child).attr("href");
		content("span").removeAttr("style").removeAttr("class");
		content("img").removeAttr("style").removeAttr("class").removeAttr("placement").removeAttr("data-toggle").removeAttr("trigger").removeAttr("referrerpolicy");
		content("br").removeAttr("style").removeAttr("class");
		content("p").removeAttr("style").removeAttr("class");
		content(".space10, .ddf").remove();
		item.description += content(".main_article").html() ?? "";
		return item;
	})));
	return {
		title: `羊城晚报金羊网 - ${nodeName}`,
		link: String(nodeLink === "" ? "https://www.ycwb.com/" : nodeLink),
		item: items
	};
}
//#endregion
export { route };
