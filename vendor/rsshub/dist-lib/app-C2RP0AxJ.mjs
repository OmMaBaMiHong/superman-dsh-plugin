import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/gzdaily/app.tsx
const route = {
	path: "/app/:column?",
	categories: ["traditional-media"],
	example: "/gzdaily/app/74",
	parameters: { column: "栏目 ID，点击对应栏目后在地址栏找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "客户端",
	maintainers: ["TimWu007"],
	handler,
	description: `::: tip
在北京时间深夜可能无法获取内容。
:::

常用栏目 ID：

| 栏目名 | ID   |
| ------ | ---- |
| 首页   | 74   |
| 时局   | 374  |
| 广州   | 371  |
| 大湾区 | 397  |
| 城区   | 2980 |`
};
async function handler(ctx) {
	const column = ctx.req.param("column") ?? 74;
	const { data: response } = await got_default(`https://app.gzdaily.cn/app_if/getArticles?columnId=${column}&page=1`);
	const list = response.list.filter((i) => i.newstype === 0).map((item) => ({
		title: item.title,
		description: renderToString(/* @__PURE__ */ jsx(Fragment, { children: item.picBig ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: item.picBig }), /* @__PURE__ */ jsx("br", {})] }) : null })),
		pubDate: timezone(parseDate(item.publishtime), 8),
		link: item.shareUrl,
		colName: item.colName,
		author: item.arthorName
	}));
	let colName = "";
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		colName = colName === "" ? item.colName : colName;
		if (content(".abstract").text()) {
			content(".abstract").find("span").remove();
			item.description += "<blockquote>" + content(".abstract").text() + "</blockquote>";
		}
		item.description += content(".article").html() ?? "";
		return item;
	})));
	return {
		title: `广州日报客户端 - ${colName}`,
		link: `https://www.gzdaily.cn/amucsite/web/index.html#/home/${column}`,
		item: items
	};
}
//#endregion
export { route };
