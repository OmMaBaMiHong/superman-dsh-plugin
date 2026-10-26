import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
//#region lib/routes/zjgtjy/index.ts
const route = {
	path: "/:type?",
	name: "Unknown",
	maintainers: ["Fatpandac"],
	handler
};
async function handler(ctx) {
	const host = `https://td.zjgtjy.cn:8553/devops/noticeInfo/queryNoticeInfoList?pageSize=10&pageNumber=1&noticeType=${ctx.req.param("type") === "all" ? "" : ctx.req.param("type").toUpperCase()}&sort=DESC`;
	const data = (await rofetch(host)).data;
	return {
		title: "浙江土地使用权挂牌公告",
		link: host,
		item: await Promise.all(data.map(async (item) => {
			const pageUrl = `https://td.zjgtjy.cn:8553/devops/noticeInfo/queryNoticeLandContentDetails?noticeId=${item.GGID}&transactionMode=${item.JYFS}`;
			const pageLink = `https://td.zjgtjy.cn/view/trade/announcement/detail?id=${item.GGID}&category=${item.ZYLB}&type=${item.JYFS}`;
			const desc = await cache_default.tryGet(pageUrl, async () => {
				let desc = await rofetch(pageUrl);
				desc = desc.queryNoticeContent.GGNR;
				desc = desc.replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&quot;", "\"");
				return desc;
			});
			return {
				title: item.GGMC,
				description: desc,
				link: pageLink,
				pubDate: item.GGFBSJ
			};
		}))
	};
}
//#endregion
export { route };
