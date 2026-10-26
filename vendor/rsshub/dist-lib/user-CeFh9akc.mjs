import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as calculate } from "./util-DLHZnIJK.mjs";
//#region lib/routes/xiaoheihe/user.ts
const route = {
	path: "/user/:id",
	categories: ["game"],
	example: "/xiaoheihe/user/30664023",
	parameters: { id: "用户 ID" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "用户动态",
	maintainers: ["tssujt"],
	handler
};
async function handler(ctx) {
	const userId = ctx.req.param("id");
	const username = (await got_default({
		method: "get",
		url: `https://api.xiaoheihe.cn/bbs/app/profile/user/profile?lang=zh-cn&version=1.3.303&userid=${userId}`
	})).data.result.account_detail.username;
	let items = (await got_default({
		method: "get",
		url: `https://api.xiaoheihe.cn/bbs/app/profile/events?lang=zh-cn&version=1.3.303&userid=${userId}&list_type=moment`
	})).data.result.moments.filter((item) => item.linkid !== void 0).map((item) => ({
		linkId: item.linkid,
		link: `https://api.xiaoheihe.cn/v3/bbs/app/api/web/share?link_id=${item.linkid}`,
		title: item.title,
		pubDate: parseDate(item.modify_at * 1e3),
		description: item.description
	}));
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = (await got_default({
			method: "get",
			url: calculate(`https://api.xiaoheihe.cn/bbs/app/api/share/data/?os_type=web&app=heybox&client_type=mobile&version=999.0.3&x_client_type=web&x_os_type=Mac&x_app=heybox&heybox_id=-1&offset=0&limit=3&link_id=${item.linkId}&use_concept_type=`)
		})).data.link.content[0].text;
		delete item.linkId;
		return item;
	})));
	return {
		title: `${username} 的动态`,
		link: "https://xiaoheihe.cn",
		item: items
	};
}
//#endregion
export { route };
