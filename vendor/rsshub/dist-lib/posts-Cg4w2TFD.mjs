import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as header, r as processImage, t as getSignedHeader } from "./utils-BpoeGnFo.mjs";
import { load } from "cheerio";
//#region lib/routes/zhihu/posts.ts
const route = {
	path: "/posts/:usertype/:id",
	categories: ["social-media"],
	example: "/zhihu/posts/people/frederchen",
	parameters: {
		usertype: "作者 id，可在用户主页 URL 中找到",
		id: "用户类型usertype，参考用户主页的URL。目前有两种，见下表"
	},
	features: {
		requireConfig: [{
			name: "ZHIHU_COOKIES",
			description: "",
			optional: true
		}],
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.zhihu.com/:usertype/:id/posts", "www.zhihu.com/:usertype/:id"] }],
	name: "用户文章",
	maintainers: ["whtsky", "Colin-XKL"],
	handler,
	description: `| 普通用户 | 机构用户 |
| -------- | -------- |
| people   | org      |`
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const usertype = ctx.req.param("usertype");
	const userProfile = await cache_default.tryGet(`zhihu:posts:profile:${id}`, async () => {
		const userAPIPath = `/${usertype === "people" ? "people" : "org"}/${id}`;
		const $ = load(await rofetch(`https://www.zhihu.com${userAPIPath}`, { headers: {
			...header,
			...await getSignedHeader(`https://www.zhihu.com/${usertype}/${id}/`, userAPIPath),
			Referer: `https://www.zhihu.com/${usertype}/${id}/`
		} }));
		return JSON.parse($("#js-initialData").text())?.initialState?.entities?.users[id];
	});
	const apiPath = `/api/v4/${usertype === "people" ? "members" : "org"}/${id}/articles?${new URLSearchParams({
		include: "data[*].comment_count,suggest_edit,is_normal,thumbnail_extra_info,thumbnail,can_comment,comment_permission,admin_closed_comment,content,voteup_count,created,updated,upvoted_followees,voting,review_info,reaction_instruction,is_labeled,label_info;data[*].vessay_info;data[*].author.badge[?(type=best_answerer)].topics;data[*].author.vip_info;",
		offset: "0",
		limit: "20",
		sort_by: "created"
	})}`;
	const signedHeader = await getSignedHeader(`https://www.zhihu.com/${usertype}/${id}/posts`, apiPath);
	const items = (await rofetch(`https://www.zhihu.com${apiPath}`, { headers: {
		...header,
		...signedHeader,
		Referer: `https://www.zhihu.com/${usertype}/${id}/posts`
	} })).data.map((item) => ({
		title: item.title,
		description: processImage(item.content),
		link: `https://zhuanlan.zhihu.com/p/${item.id}`,
		pubDate: parseDate(item.created, "X"),
		updated: parseDate(item.updated, "X"),
		author: item.author.name
	}));
	return {
		title: `${userProfile.name} 的知乎文章`,
		link: `https://www.zhihu.com/${usertype}/${id}/posts`,
		description: userProfile.headline,
		image: userProfile.avatarUrl.split("?", 1)[0],
		item: items
	};
}
//#endregion
export { route };
