import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
//#region lib/routes/codefather/posts.ts
const validCategories = /* @__PURE__ */ new Set([
	"交流",
	"学习",
	"项目",
	"资源",
	"经验"
]);
const sortFieldMap = {
	hot: {
		field: "thumbNum",
		name: "热门"
	},
	new: {
		field: "createTime",
		name: "最新"
	},
	recommend: {
		field: "recommendTime",
		name: "推荐"
	}
};
const route = {
	path: "/posts/:category?/:sort?",
	categories: ["programming"],
	example: "/codefather/posts",
	parameters: {
		category: "分类，可选 `交流`、`学习`、`项目`、`资源`、`经验`，默认为全部",
		sort: "排序方式，可选 `new`（最新）、`hot`（热门）、`recommend`（推荐），默认为 `new`"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.codefather.cn/", "www.codefather.cn"],
		target: "/posts"
	}],
	name: "帖子",
	maintainers: ["JackyST0"],
	handler,
	description: "获取编程导航社区的帖子，支持按热门、最新、推荐排序，支持按分类筛选。"
};
async function handler(ctx) {
	const category = ctx.req.param("category");
	const sort = ctx.req.param("sort") || "new";
	const sortConfig = sortFieldMap[sort] || sortFieldMap.new;
	const requestBody = {
		current: 1,
		pageSize: 20,
		sortField: sortConfig.field,
		sortOrder: "descend"
	};
	if (category && validCategories.has(category)) requestBody.category = category;
	const response = await rofetch("https://api.codefather.cn/api/post/list/page/vo", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: requestBody
	});
	if (response.code !== 0) throw new Error(`API error: ${response.message}`);
	const items = (response.data?.records || []).map((item) => {
		const content = item.content || "";
		const pictureList = item.pictureList || [];
		const user = item.user || {};
		const tags = item.tags || [];
		let description = `<p>${content.replaceAll("\n", "<br>")}</p>`;
		if (pictureList.length > 0) {
			description += "<div>";
			for (const pic of pictureList) description += `<img src="${pic}" style="max-width: 100%;" />`;
			description += "</div>";
		}
		return {
			title: content.split("\n", 1)[0] || "无标题",
			link: `https://www.codefather.cn/post/${item.id}`,
			description,
			pubDate: parseDate(item.createTime),
			author: user.userName,
			category: [item.category, ...tags.map((t) => t.tagName)].filter(Boolean),
			upvotes: item.thumbNum,
			comments: item.commentNum
		};
	});
	const categoryName = category ? `${category} - ` : "";
	const sortName = sortConfig.name;
	return {
		title: `编程导航 - ${categoryName}${sortName}帖子`,
		link: "https://www.codefather.cn/",
		description: `编程导航社区${categoryName}${sortName}帖子`,
		item: items
	};
}
//#endregion
export { route };
