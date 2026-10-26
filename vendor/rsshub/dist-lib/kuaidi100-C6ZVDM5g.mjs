import { t as utils_default } from "./utils-QkYwN0Qe.mjs";
//#region lib/routes/kuaidi100/index.ts
const route = {
	path: "/track/:number/:id/:phone?",
	categories: ["other"],
	example: "/kuaidi100/track/shunfeng/SF1007896781640/0383",
	parameters: {
		number: "快递公司代号",
		id: "订单号",
		phone: "手机号后四位（仅顺丰）"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "快递订单追踪",
	maintainers: ["NeverBehave"],
	handler,
	description: `快递公司代号如果不能确定，可通过下方快递列表获得。

::: warning

1. 构造链接前请确认所有参数正确：错误\`快递公司 - 订单号\`组合将会缓存信息一小段时间防止产生无用查询
2. 正常查询的订单在未签收状态下不会被缓存：请控制查询频率
3. 订单完成后请尽快取消订阅，避免资源浪费

:::`
};
async function handler(ctx) {
	const { number, id, phone } = ctx.req.param();
	const { status, message, company } = await utils_default.checkCode(number, id, phone);
	let data;
	const time = (/* @__PURE__ */ new Date()).toString();
	if (status) {
		const query = await utils_default.getQuery(number, id, phone);
		data = query.status === "200" ? query.data : [{
			context: query.message,
			time
		}];
	} else throw new Error(`[本地]信息有误，请检查后重试：${message}`);
	return {
		title: `快递 ${company.name}-${id}`,
		link: "https://www.kuaidi100.com",
		description: `快递 ${company.name}-${id}`,
		item: data.map((item) => ({
			title: item.context,
			description: item.context,
			guid: new Date(item.time || item.ftime).toUTCString(),
			pubDate: new Date(item.time || item.ftime).toUTCString(),
			link: "https://www.kuaidi100.com"
		}))
	};
}
//#endregion
export { route };
