import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import dayjs from "dayjs";
import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/guduodata/daily.tsx
const host = "http://d.guduodata.com";
const types = {
	collect: {
		name: "汇总榜",
		categories: {
			drama: "连续剧",
			variety: "综艺"
		}
	},
	bill: {
		name: "排行榜",
		categories: {
			network_drama: "网络剧",
			network_movie: "网络大电影",
			network_variety: "网络综艺",
			tv_drama: "电视剧",
			tv_variety: "电视综艺",
			anime: "国漫"
		}
	}
};
const route = {
	path: "/daily",
	categories: ["other"],
	example: "/guduodata/daily",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["guduodata.com/"] }],
	name: "日榜",
	maintainers: ["Gem1ni"],
	handler,
	url: "guduodata.com/"
};
async function handler() {
	const now = dayjs().valueOf();
	const yestoday = dayjs().subtract(1, "day").format("YYYY-MM-DD");
	const renderRows = (rows) => renderToString(/* @__PURE__ */ jsx(GuduodataDailyTable, { rows }));
	const items = Object.keys(types).flatMap((key) => Object.entries(types[key].categories).map(([category, categoryName]) => ({
		type: key,
		name: `[${yestoday}] ${types[key].name} - ${categoryName}`,
		category: category.toUpperCase(),
		url: `${host}/m/v3/billboard/list?type=DAILY&category=${category.toUpperCase()}&date=${yestoday}`
	})));
	return {
		title: "骨朵数据 - 日榜",
		link: host,
		description: yestoday,
		item: await Promise.all(items.map((item) => cache_default.tryGet(item.url, async () => {
			const data = (await got_default.get(`${item.url}&t=${now}`, { headers: { Referer: "http://guduodata.com/" } })).data.data;
			return {
				title: item.name,
				pubDate: yestoday,
				link: item.url,
				description: renderRows(data)
			};
		})))
	};
}
const GuduodataDailyTable = ({ rows }) => /* @__PURE__ */ jsxs("table", {
	border: "1",
	cellpadding: "2",
	cellspacing: "0",
	children: [/* @__PURE__ */ jsxs("thead", { children: [
		/* @__PURE__ */ jsx("th", { children: "排名" }),
		/* @__PURE__ */ jsx("th", { children: "剧名" }),
		/* @__PURE__ */ jsx("th", { children: "播放平台" }),
		/* @__PURE__ */ jsx("th", { children: "上映时间" }),
		/* @__PURE__ */ jsx("th", { children: "评论数" }),
		/* @__PURE__ */ jsx("th", { children: "百度指数" }),
		/* @__PURE__ */ jsx("th", { children: "豆瓣评分" }),
		/* @__PURE__ */ jsx("th", { children: "全网热度" })
	] }), /* @__PURE__ */ jsx("tbody", { children: rows.map((row, index) => /* @__PURE__ */ jsxs("tr", { children: [
		/* @__PURE__ */ jsx("td", { children: index + 1 }),
		/* @__PURE__ */ jsx("td", { children: row.name }),
		/* @__PURE__ */ jsx("td", { children: row.platforms }),
		/* @__PURE__ */ jsx("td", { children: row.release_date }),
		/* @__PURE__ */ jsx("td", { children: row.comment || "" }),
		/* @__PURE__ */ jsx("td", { children: row.baidu_index || "" }),
		/* @__PURE__ */ jsx("td", { children: row.douban || "" }),
		/* @__PURE__ */ jsx("td", { children: row.gdi })
	] })) })]
});
//#endregion
export { route };
