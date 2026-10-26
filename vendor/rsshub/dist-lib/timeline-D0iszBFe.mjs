import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
//#region lib/routes/xueqiu/timeline.ts
const rootUrl = "https://xueqiu.com";
const route = {
	path: "/timeline/:usergroup_id?",
	categories: ["finance"],
	example: "/xueqiu/timeline/",
	parameters: { usergroup_id: "用户组 ID，-1 为全部关注用户" },
	features: {
		requireConfig: [{
			name: "XUEQIU_COOKIES",
			description: ""
		}],
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "用户关注时间线",
	maintainers: ["ErnestDong"],
	handler,
	description: `::: warning
用户关注动态需要登录后的 Cookie 值，所以只能自建，详情见部署页面的配置模块。
:::

| -1   | -2       | 1             |
| ---- | -------- | ------------- |
| 全部 | 关注精选 | 自定义第 1 组 |`
};
async function handler(ctx) {
	const cookie = config.xueqiu.cookies;
	const limit = ctx.req.query("limit") || 15;
	const usergroup_id = ctx.req.param("usergroup_id") ?? -1;
	if (cookie === void 0) throw new ConfigNotFoundError("缺少雪球用户登录后的 Cookie 值");
	let out = [];
	let max_id = -1;
	async function fetchItems() {
		const data = await fetchNextID(max_id, cookie, usergroup_id);
		const items = await Promise.all(data.home_timeline.map((item) => cache_default.tryGet(item.target, async () => {
			const retweetedStatus = item.retweeted_status ? `<blockquote>${item.retweeted_status.user.screen_name}:&nbsp;${item.retweeted_status.description}</blockquote>` : "";
			const description = item.description + retweetedStatus;
			return await Promise.resolve({
				title: item.title === "" ? item.user.screen_name + (item.retweeted_status ? " 转发" : "") : item.title,
				description: item.text ? item.text + retweetedStatus : description,
				pubDate: parseDate(item.created_at),
				link: rootUrl + item.target
			});
		})));
		out = [...out, ...items];
		max_id = data.next_max_id;
		if (out.length < limit) await fetchItems();
	}
	await fetchItems();
	return {
		title: "雪球关注动态",
		link: "https://xueqiu.com/",
		item: out
	};
}
async function fetchNextID(max_id, cookie, usergroup_id = -1) {
	let url = `https://xueqiu.com/v4/statuses/system/home_timeline.json?source=user&usergroup_id=${usergroup_id}`;
	if (max_id > 0) url += `&max_id=${max_id}`;
	return (await got_default({
		method: "get",
		url,
		headers: { Cookie: cookie }
	})).data;
}
//#endregion
export { route };
