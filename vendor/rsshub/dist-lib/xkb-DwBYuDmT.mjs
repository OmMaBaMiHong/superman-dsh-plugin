import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/xkb/index.tsx
const route = {
	path: "/:channel",
	categories: ["traditional-media"],
	example: "/xkb/350",
	parameters: { channel: "栏目 ID，点击对应栏目后在地址栏找到" },
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
	description: `常用栏目 ID：

| 栏目名 | ID  |
| ------ | --- |
| 首页   | 350 |
| 重点   | 359 |
| 广州   | 353 |
| 湾区   | 360 |
| 天下   | 355 |`
};
async function handler(ctx) {
	const channel = ctx.req.param("channel") ?? 350;
	const { data: response } = await got_default({
		method: "get",
		url: `https://www.xkb.com.cn/xkbapp/fundapi/article/api/articles?chnlId=${channel}&visibility=1&page=0&size=20&keyword=`,
		headers: { siteId: 35 }
	});
	const list = response.data.filter((i) => i.contentUrl).map((item) => ({
		title: item.listTitle,
		description: renderToString(/* @__PURE__ */ jsx(Fragment, { children: item.shareImg ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: item.shareImg }), /* @__PURE__ */ jsx("br", {})] }) : null })),
		pubDate: timezone(parseDate(item.operTime), 8),
		link: "https://www.xkb.com.cn/detail?id=" + item.id,
		contentUrl: item.contentUrl,
		author: item.metaInfo.author,
		chnlName: item.metaInfo.chnlName
	}));
	let chnlName = "";
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.contentUrl, async () => {
		const detailResponse = await got_default({
			method: "get",
			url: item.contentUrl
		});
		item.description += detailResponse.data.htmlContent ?? "";
		chnlName = chnlName === "" ? item.chnlName : chnlName;
		return item;
	})));
	return {
		title: `新快报新快网 - ${chnlName}`,
		link: `https://www.xkb.com.cn/home?id=${channel}`,
		item: items
	};
}
//#endregion
export { route };
