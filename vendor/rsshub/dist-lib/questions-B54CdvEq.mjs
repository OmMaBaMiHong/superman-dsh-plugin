import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
//#region lib/routes/codefather/questions.ts
const route = {
	path: "/questions/:sort?",
	categories: ["programming"],
	example: "/codefather/questions",
	parameters: { sort: "排序方式，可选 `new`（最新）、`hot`（热门），默认为 `new`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.codefather.cn/qa", "www.codefather.cn"],
		target: "/questions"
	}],
	name: "问答",
	maintainers: ["JackyST0"],
	handler,
	description: "获取编程导航社区的问答内容，支持按最新、热门排序。"
};
async function handler(ctx) {
	const sortConfig = (ctx.req.param("sort") || "new") === "hot" ? {
		field: "favourNum",
		name: "热门"
	} : {
		field: "createTime",
		name: "最新"
	};
	const response = await rofetch("https://api.codefather.cn/api/qa/list/page/vo", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: {
			current: 1,
			pageSize: 20,
			sortField: sortConfig.field,
			sortOrder: "descend"
		}
	});
	if (response.code !== 0) throw new Error(`API error: ${response.message}`);
	const items = (response.data?.records || []).map((item) => {
		const title = item.title || "无标题";
		const content = item.content || "";
		const user = item.user || {};
		const tags = item.tags || [];
		const bestComment = item.bestComment;
		let description = `<div>${content.replaceAll("\n", "<br>")}</div>`;
		if (bestComment) {
			const answerUser = bestComment.user || {};
			description += "<hr><h4>💡 最佳回答</h4>";
			description += `<p><strong>${answerUser.userName || "匿名"}</strong>：</p>`;
			description += `<p>${bestComment.plainTextDescription || ""}</p>`;
		}
		return {
			title,
			link: `https://www.codefather.cn/qa/${item.id}`,
			description,
			pubDate: parseDate(item.createTime),
			author: user.userName,
			category: tags,
			upvotes: item.thumbNum,
			comments: item.commentNum
		};
	});
	return {
		title: `编程导航 - ${sortConfig.name}问答`,
		link: "https://www.codefather.cn/qa",
		description: `编程导航社区${sortConfig.name}问答`,
		item: items
	};
}
//#endregion
export { route };
