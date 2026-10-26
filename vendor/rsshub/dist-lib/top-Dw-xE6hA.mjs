import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/baidu/top.tsx
const renderDescription = (item) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	item.img ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: item.img }), /* @__PURE__ */ jsx("br", {})] }) : null,
	item.show ? item.show.map((text) => /* @__PURE__ */ jsxs(Fragment, { children: [text, /* @__PURE__ */ jsx("br", {})] })) : null,
	item.desc
] }));
const route = {
	path: "/top/:board?",
	categories: ["other"],
	example: "/baidu/top",
	parameters: { board: "榜单，默认为 `realtime`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "热搜榜单",
	maintainers: ["xyqfer"],
	handler,
	description: `| 热搜榜   | 小说榜 | 电影榜 | 电视剧榜 | 汽车榜 | 游戏榜 |
| -------- | ------ | ------ | -------- | ------ | ------ |
| realtime | novel  | movie  | teleplay | car    | game   |`
};
async function handler(ctx) {
	const { board = "realtime" } = ctx.req.param();
	const link = `https://top.baidu.com/board?tab=${board}`;
	const { data: response } = await got_default(link);
	const $ = load(response);
	const { data } = JSON.parse($("#sanRoot").contents().filter((e) => e.nodeType === 8).prevObject[0].data.match(/s-data:(.*)/)[1]);
	const items = data.cards[0].content.map((item) => ({
		title: item.word,
		description: renderDescription(item),
		link: item.rawUrl
	}));
	return {
		title: `${data.curBoardName} - 百度热搜`,
		description: $("meta[name=\"description\"]").attr("content"),
		link,
		item: items
	};
}
//#endregion
export { route };
