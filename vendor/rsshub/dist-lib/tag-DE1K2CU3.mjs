import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as getRssItem } from "./utils-CIxqq0u9.mjs";
//#region lib/routes/lifeweek/tag.ts
const rootApiUrl = "https://www.lifeweek.com.cn/api/userWebFollow/getFollowTagContentList?type=4&sort=2&tagId";
const rootUrl = "https://www.lifeweek.com.cn/articleList";
const articleRootUrl = "https://www.lifeweek.com.cn/article";
const route = {
	path: "/tag/:id",
	radar: [{
		source: ["lifeweek.com.cn/articleList/:tag"],
		target: "/tag/:tag"
	}],
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const tag = ctx.req.param("id");
	const { data } = await got_default(`${rootApiUrl}=${tag}`);
	const result = data.model.articleResponseList;
	const items = await Promise.all(result.map((item) => {
		const articleLink = `${articleRootUrl}/${item.id}`;
		return cache_default.tryGet(articleLink, () => getRssItem(item, articleLink));
	}));
	return {
		title: data.model.tagName,
		link: `${rootUrl}/${tag}`,
		item: items
	};
}
//#endregion
export { route };
