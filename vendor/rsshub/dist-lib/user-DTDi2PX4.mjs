import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
//#region lib/routes/eastmoney/ttjj/user.ts
const route = {
	path: "/ttjj/user/:uid",
	categories: ["finance"],
	view: 1,
	example: "/eastmoney/ttjj/user/6551094298949188",
	parameters: { uid: "用户id, 可以通过天天基金App分享用户主页到浏览器，在相应的URL中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "天天基金用户动态",
	maintainers: ["zidekuls"],
	handler
};
async function handler(ctx) {
	const uid = ctx.req.param("uid");
	const urlPrefix = "https://jijinbaapi.eastmoney.com/gubaapi/v3/read";
	const username = (await got_default(`${`${urlPrefix}/User/UserInfo.ashx?ServerVersion=1.0.0&PhoneType=windows&Location=zh-CN&ctoken=&utoken=&deviceid=000000&ps=8&plat=Wap&product=Fund&version=201&followuid=`}${uid}`)).data.user_nickname || "不存在的用户";
	const data = (await got_default({
		method: "post",
		url: `${urlPrefix}/Article/Post/UserPostList.ashx`,
		headers: {
			Accept: "application/json",
			"Content-Type": "application/x-www-form-urlencoded"
		},
		form: {
			uid,
			deviceId: 666666,
			version: 201,
			p: 1,
			ps: 20
		}
	})).data.re;
	const userArticleUrl = `${urlPrefix}/Article/Post/ArticleContent.ashx`;
	const result = await Promise.all(data.map((item) => cache_default.tryGet(userArticleUrl + item.post_id, async () => {
		const description = (await got_default({
			method: "post",
			url: userArticleUrl,
			headers: {
				Accept: "application/json",
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: `postid=${item.post_id}&ServerVersion=1.0.0&PhoneType=windows&Location=zh-CN&ctoken=&utoken=&deviceId=000000&userId=&plat=Wap&product=Fund&version=201`
		})).data.post.post_content;
		return {
			title: item.post_title,
			description,
			pubDate: timezone(parseDate(item.post_display_time, "YYYY-MM-DD HH:mm:ss"), 8),
			link: `https://fundbarmob.eastmoney.com/index.html?goPage=articleView&lastPage=personDetailView&aid=${item.post_id}`
		};
	})));
	return {
		title: `天天基金-${username}的主页`,
		link: `https://fundbarmob.eastmoney.com/index.html?goPage=personDetailView&userid=${uid}`,
		description: `${username} 的动态`,
		item: result
	};
}
//#endregion
export { route };
