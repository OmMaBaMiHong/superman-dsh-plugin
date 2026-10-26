import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { a as token, i as rootUrl, n as getBoards, r as renderDesc, t as apiUrl } from "./utils-BojRSBvy.mjs";
//#region lib/routes/zuvio/student5.ts
const route = {
	path: "/student5/:board?",
	categories: ["bbs"],
	example: "/zuvio/student5/34",
	parameters: { board: "看板 ID，空为全站文章，可在看板 URL 或下方路由找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "校園話題",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const { board = "" } = ctx.req.param();
	const title = board ? (await getBoards()).find((i) => i.boardId === board).title : "全部";
	const { data } = await got_default(`${apiUrl}/article`, { searchParams: {
		api_token: token,
		user_id: "0",
		board_id: board,
		sort: "time",
		page: "1",
		device: "web",
		my_school_opinion: "1"
	} });
	const items = data.articles.map((item) => ({
		title: item.title,
		description: item.abstract,
		pubDate: timezone(parseDate(item.created_at), 8),
		link: `${rootUrl}/article/${item.id}`,
		api: `${apiUrl}/article/${item.id}`,
		author: `${item.university} ${item.user_name}`,
		category: item.board_name
	}));
	await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const { data } = await got_default(item.api, { searchParams: {
			api_token: token,
			user_id: "0",
			device: "web",
			ref: ""
		} });
		item.description = renderDesc(data);
		delete item.api;
		return item;
	})));
	return {
		title: `Zuvio 校園${title}話題 - 大學生論壇`,
		description: "Zuvio 校園話題千種動物頭像交流心得。最萌的匿名論壇，上千種逗趣動物頭像隨你變換，點頭像立即私訊功能，讓你找到共同話題的小夥伴！多人分享配對心得、聊天交友心情在此，快加入17分享！",
		image: "https://s3.hicloud.net.tw/zuvio.public/public/system/images/irs_v4/chicken/shared/webshare.png",
		link: `${rootUrl}/articles`,
		item: items,
		language: "zh-Hant"
	};
}
//#endregion
export { route };
