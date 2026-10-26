import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/asmr-200/index.tsx
const render = (work, link) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsx("a", {
		href: link,
		title: "点击进入官网查看",
		children: /* @__PURE__ */ jsx("img", {
			src: work.mainCoverUrl,
			alt: work.title
		})
	}),
	/* @__PURE__ */ jsxs("h1", { children: [
		work.title,
		" ",
		/* @__PURE__ */ jsx("span", {
			style: "font-size: 0.6em; color: darkred;",
			children: work.source_id
		})
	] }),
	/* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("b", { children: "发布者：" }), work.name] }),
	/* @__PURE__ */ jsxs("p", { children: [
		/* @__PURE__ */ jsx("b", { children: "评分：" }),
		work.rate_average_2dp,
		" | ",
		/* @__PURE__ */ jsx("b", { children: "评论数：" }),
		work.review_count,
		" | ",
		/* @__PURE__ */ jsx("b", { children: "总时长：" }),
		work.duration,
		" | ",
		/* @__PURE__ */ jsx("b", { children: "音频来源：" }),
		work.source_type
	] }),
	/* @__PURE__ */ jsxs("p", { children: [
		/* @__PURE__ */ jsx("b", { children: "价格：" }),
		/* @__PURE__ */ jsxs("span", {
			style: "color: #f44336",
			children: [work.price, " JPY"]
		}),
		" | ",
		/* @__PURE__ */ jsx("b", { children: "销量：" }),
		work.dl_count
	] }),
	/* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("b", { children: "分类：" }), work.category] }),
	/* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("b", { children: "声优：" }), work.cv] })
] }));
const route = {
	path: "/works/:order?/:subtitle?/:sort?",
	categories: ["multimedia"],
	example: "/asmr-200/works",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	parameters: {
		order: "排序字段，默认按照资源的收录日期来排序，详见下表",
		sort: "排序方式，可选 `asc` 和 `desc` ，默认倒序",
		subtitle: "筛选带字幕音频，可选 `0` 和 `1` ，默认关闭"
	},
	radar: [{
		source: ["asmr-200.com"],
		target: "asmr-200/works"
	}],
	name: "最新收录",
	maintainers: ["hualiong"],
	url: "asmr-200.com",
	description: `| 发售日期 | 收录日期     | 销量      | 价格  | 评价               | 随机   | RJ 号 |
| -------- | ------------ | --------- | ----- | ------------------ | ------ | ----- |
| release  | create\\_date | dl\\_count | price | rate\\_average\\_2dp | random | id    |`,
	handler: async (ctx) => {
		const { order = "create_date", sort = "desc", subtitle = "0" } = ctx.req.param();
		return {
			title: "最新收录 - ASMR Online",
			link: "https://asmr-200.com/",
			item: (await rofetch("https://api.asmr-200.com/api/works", { query: {
				order,
				sort,
				page: 1,
				subtitle
			} })).works.map((each) => {
				const category = each.tags.map((tag) => tag.name);
				each.category = category.join("，");
				each.cv = each.vas.map((cv) => cv.name).join("，");
				return {
					title: each.title,
					image: each.mainCoverUrl,
					author: each.name,
					link: `https://asmr-200.com/work/${each.source_id}`,
					pubDate: timezone(parseDate(each.release, "YYYY-MM-DD"), 8),
					category,
					description: render(each, `https://asmr-200.com/work/${each.source_id}`)
				};
			})
		};
	}
};
//#endregion
export { route };
