import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/taobao/zhongchou.tsx
const route = {
	path: "/zhongchou/:type?",
	categories: ["shopping"],
	example: "/taobao/zhongchou/all",
	parameters: { type: "类型, 默认为 `all` 全部" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "众筹项目",
	maintainers: ["xyqfer", "Fatpandac"],
	handler,
	description: `| 全部 | 科技 | 食品        | 动漫 | 设计   | 公益 | 娱乐 | 影音  | 书籍 | 游戏 | 其他  |
| ---- | ---- | ----------- | ---- | ------ | ---- | ---- | ----- | ---- | ---- | ----- |
| all  | tech | agriculture | acg  | design | love | tele | music | book | game | other |`
};
async function handler(ctx) {
	const { type = "all" } = ctx.req.param();
	const items = (await got_default({
		method: "get",
		url: `https://izhongchou.taobao.com/dream/ajax/getProjectListNew.htm?_input_charset=utf-8&type=6&pageSize=20&page=1&sort=1&status=&projectType=${encodeURIComponent({
			all: "",
			tech: "121288001",
			agriculture: "123330001,125672021",
			acg: "122018001",
			design: "121292001,126176002,126202001",
			love: "121280001",
			tele: "121284001",
			music: "121278001",
			book: "121274002",
			game: "122020001",
			other: "125706031,125888001,125886001,123332001"
		}[type])}&_=${Date.now()}&callback=`
	})).data.data.map((item) => {
		return {
			title: item.name,
			link: `https://izhongchou.taobao.com/dreamdetail.htm?id=${item.id}`,
			description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("img", { src: item.image }),
				/* @__PURE__ */ jsx("br", {}),
				/* @__PURE__ */ jsx("br", {}),
				/* @__PURE__ */ jsx("strong", { children: "达成率:" }),
				" ",
				`${item.finish_per}%`,
				/* @__PURE__ */ jsx("br", {}),
				/* @__PURE__ */ jsx("strong", { children: "已筹金额:" }),
				" ",
				`${item.curr_money}元`,
				/* @__PURE__ */ jsx("br", {}),
				/* @__PURE__ */ jsx("strong", { children: "支持人数:" }),
				" ",
				item.buy_amount,
				/* @__PURE__ */ jsx("br", {})
			] })),
			guid: item.id
		};
	});
	return {
		title: `淘宝众筹-${type}`,
		link: "https://izhongchou.taobao.com/index.htm",
		item: items
	};
}
//#endregion
export { route };
