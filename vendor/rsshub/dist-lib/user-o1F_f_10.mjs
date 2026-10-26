import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as utils_default } from "./utils-B8jMr_Kb.mjs";
import { load } from "cheerio";
//#region lib/routes/pingwest/user.ts
const route = {
	path: "/user/:uid/:type?/:option?",
	categories: ["new-media"],
	example: "/pingwest/user/7781550877/article",
	parameters: {
		uid: "用户id, 可从用户主页中得到",
		type: "内容类型, 默认为`article`",
		option: "参数"
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
		source: ["pingwest.com/user/:uid/:type", "pingwest.com/"],
		target: "/user/:uid/:type"
	}],
	name: "用户",
	maintainers: ["sanmmm"],
	handler,
	description: `内容类型

| 文章    | 动态  |
| ------- | ----- |
| article | state |

参数

- \`fulltext\`，全文输出，例如：\`/pingwest/user/7781550877/article/fulltext\``
};
async function handler(ctx) {
	const { uid, type = "article", option } = ctx.req.param();
	const baseUrl = "https://www.pingwest.com";
	const aimUrl = `${baseUrl}/user/${uid}/${type}`;
	const { userName, realUid, userSign, userAvatar } = await cache_default.tryGet(`pingwest:user:info:${uid}`, async () => {
		const $ = load((await got_default(aimUrl, { headers: { Referer: baseUrl } })).data);
		const userInfoNode = $("#J_userId");
		return {
			userName: userInfoNode.text(),
			realUid: userInfoNode.attr("data-user-id"),
			userSign: $("#J_userSign").text(),
			userAvatar: $("#J_userAvatar").attr("src")
		};
	});
	const $ = load((await got_default(`${baseUrl}/api/user_data`, {
		searchParams: {
			page: 1,
			user_id: realUid,
			tab: type
		},
		headers: { Referer: baseUrl }
	})).data.data.list);
	let item;
	const needFullText = option === "fulltext";
	switch (type) {
		case "article":
			item = await utils_default.articleListParser($, needFullText, cache_default);
			break;
		case "state":
			item = utils_default.statusListParser($);
			break;
		default: throw new Error(`Unknown type: ${type}`);
	}
	return {
		title: `品玩 - ${userName} - ${{
			article: "文章",
			state: "动态"
		}[type]}`,
		description: userSign,
		image: userAvatar,
		link: aimUrl,
		item
	};
}
//#endregion
export { route };
