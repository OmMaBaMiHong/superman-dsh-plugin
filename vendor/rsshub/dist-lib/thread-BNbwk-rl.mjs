import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
//#region lib/routes/deepin/thread.ts
const route = {
	path: "/threads/:type?",
	categories: ["bbs"],
	example: "/deepin/threads/latest",
	parameters: { type: {
		description: "主题类型",
		options: [{
			value: "hot",
			label: "最热主题"
		}, {
			value: "latest",
			label: "最新主题"
		}]
	} },
	name: "首页主题列表",
	maintainers: ["myml"],
	radar: [{
		source: ["bbs.deepin.org"],
		target: "/threads/latest"
	}],
	handler
};
const TypeMap = {
	hot: {
		where: "hot_value",
		title: "最热主题"
	},
	latest: {
		where: "id",
		title: "最新主题"
	}
};
async function handler(ctx) {
	let type = TypeMap.latest;
	if (ctx.req.param("type") === "hot") type = TypeMap.hot;
	const res = await rofetch("https://bbs.deepin.org.cn/api/v1/thread/index", {
		query: {
			languages: "zh_CN",
			order: "updated_at",
			where: type.where
		},
		headers: { accept: "application/json" }
	});
	const items = await Promise.all(res.ThreadIndex.map((thread) => {
		const link = "https://bbs.deepin.org.cn/post/" + thread.id;
		return cache_default.tryGet(link, async () => {
			const item = {
				id: String(thread.id),
				title: thread.subject,
				link,
				pubDate: parseDate(thread.created_at),
				author: thread.user.nickname,
				category: [thread.forum.name],
				description: ""
			};
			const cacheData = await rofetch("https://bbs.deepin.org.cn/api/v1/thread/info?id=" + item.id);
			if (cacheData) item.description = cacheData.data.post.message;
			return item;
		});
	}));
	return {
		title: "deepin论坛主页 - " + type.title,
		link: "https://bbs.deepin.org",
		item: items
	};
}
//#endregion
export { route };
