import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/nowcoder/hots.ts
const route = {
	path: "/hots/:type?",
	categories: ["bbs"],
	example: "/nowcoder/hots/1?limit=20",
	parameters: { type: "热榜类型，`1` 指热议话题，`2` 指全站热贴，默认为 `1`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["mnowpick.nowcoder.com/m/discuss/hot"] }],
	name: "牛客热榜",
	description: "牛客热榜，包括热议话题和全站热贴",
	maintainers: ["xia0ne"],
	handler,
	url: "nowcoder.com/"
};
async function handler(ctx) {
	const type = ctx.req.param("type") ?? "1";
	const limit = Number(ctx.req.query("limit") ?? "20");
	const size = Number.isFinite(limit) && limit > 0 ? limit : 20;
	let link;
	if (type === "1") {
		link = `https://gw-c.nowcoder.com/api/sparta/subject/hot-subject?limit=${size}&_=${Date.now()}&t=`;
		const responseBody = (await got_default.get(link)).data;
		if (responseBody.code !== 0) throw new Error(`接口错误，错误代码:${responseBody.code},错误原因:${responseBody.msg}`);
		return {
			title: "牛客网-热议话题",
			link: "https://mnowpick.nowcoder.com/m/discuss/hot",
			description: "牛客网-热议话题",
			item: responseBody.data.result.map((item) => ({
				title: item.content,
				description: `<img src="${item.numberIcon}" alt="rank">`,
				link: `https://www.nowcoder.com/creation/subject/${item.uuid}`
			}))
		};
	}
	if (type === "2") {
		link = `https://gw-c.nowcoder.com/api/sparta/hot-search/top-hot-pc?size=${size}&_=${Date.now()}&t=`;
		const responseBody = (await got_default.get(link)).data;
		if (responseBody.code !== 0) throw new Error(`接口错误，错误代码: ${responseBody.code}，错误原因: ${responseBody.msg}`);
		return {
			title: "牛客网-全站热贴",
			link: "https://mnowpick.nowcoder.com/m/discuss/hot",
			description: "牛客网-全站热贴",
			item: responseBody.data.result.map((item) => ({
				title: item.title,
				link: `https://www.nowcoder.com/feed/main/detail/${item.uuid}`
			}))
		};
	}
	throw new Error("Invalid type parameter");
}
//#endregion
export { route };
