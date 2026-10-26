import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/aicaijing/index.tsx
const route = {
	path: "/:category?/:id?",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "latest";
	const id = ctx.req.param("id") ?? 14;
	const categories = {
		latest: {
			url: "",
			title: "最新文章"
		},
		recommend: {
			url: "&isRecommend=true",
			title: "推荐资讯"
		},
		cover: {
			url: "&position=1",
			title: "封面文章"
		},
		information: {
			url: `&categoryId=${id}`,
			title: {
				14: "热点 - 最新",
				5: "热点 - 科技",
				9: "热点 - 消费",
				7: "热点 - 出行",
				13: "热点 - 文娱",
				10: "热点 - 教育",
				25: "热点 - 地产",
				11: "热点 - 更多",
				28: "深度 - 出行",
				29: "深度 - 科技",
				31: "深度 - 消费",
				33: "深度 - 教育",
				34: "深度 - 更多",
				8: "深度 - 地产",
				6: "深度 - 文娱"
			}[id]
		}
	};
	const rootUrl = "https://www.aicaijing.com.cn";
	const items = (await got_default({
		method: "get",
		url: `https://api.aicaijing.com.cn/article/detail/list?size=${ctx.req.query("limit") ?? 50}&page=1${categories[category].url}`
	})).data.data.items.map((item) => ({
		title: item.title,
		link: `${rootUrl}/article/${item.articleId}`,
		author: item.userInfo.nickname,
		pubDate: parseDate(item.createTime),
		category: [item.category.name, ...item.tags.map((t) => t.name)],
		description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [item.cover ? /* @__PURE__ */ jsx("img", { src: item.cover }) : null, item.content ? raw(item.content) : null] }))
	}));
	return {
		title: `AI 财经社 - ${categories[category].title}`,
		link: rootUrl,
		item: items
	};
}
//#endregion
export { route };
