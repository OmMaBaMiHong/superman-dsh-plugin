import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
//#region lib/routes/sspai/prime-community.ts
const route = {
	path: "/prime/community",
	categories: ["new-media"],
	example: "/sspai/prime/community",
	features: {
		requireConfig: [{
			name: "SSPAI_BEARERTOKEN",
			optional: false,
			description: `少数派会员账号认证 token。获取方式：登陆后打开少数派会员社区界面，打开浏览器开发者工具中 “网络”(Network) 选项卡，筛选 URL 找到任一个地址为 \`sspai.com/api\` 开头的请求，点击检查其 “消息头”，在 “请求头” 中找到Authorization字段，将其值复制填入配置即可。你的配置应该形如 \`SSPAI_BEARERTOKEN: 'Bearer eyJxxxx......xx_U8'\`。`
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["sspai.com/community"] }],
	name: "会员社区",
	maintainers: ["mintyfrankie"],
	handler
};
const TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjcyNzU3NiIsInR5cGUiOiJ1c2VyIiwiZXhwIjoxNzQ4NTI2MDEzfQ.di8RB-lxHI_JMBQHFd2xhcpk6Zd_3bvfQlAti6HAuZA";
async function handler() {
	let token;
	const cacheIn = await cache_default.get("sspai:token");
	if (cacheIn) token = cacheIn;
	else if (config.sspai.bearertoken) {
		token = config.sspai.bearertoken;
		cache_default.set("sspai:token", config.sspai.bearertoken);
	} else token = TOKEN;
	const feedEndpoint = "https://sspai.com/api/v1/community/page/get";
	const headers = { Authorization: token };
	const list = (await rofetch(feedEndpoint, { headers })).data.map((item) => ({
		title: item.title,
		link: `https://sspai.com/t/${item.id_hash}`,
		pubDate: /* @__PURE__ */ new Date(item.created_at * 1e3),
		author: item.author.nickname,
		category: item.channel.title,
		id_hash: item.id_hash
	}));
	return {
		title: "少数派会员社区",
		link: "https://sspai.com/community",
		lang: "zh-CN",
		description: "少数派会员社区",
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			item.description = (await rofetch(`https://sspai.com/api/v1/community/topic/single/info/get?id_hash=${item.id_hash}`, { headers })).data.body || "No content";
			return item;
		})))
	};
}
//#endregion
export { route };
