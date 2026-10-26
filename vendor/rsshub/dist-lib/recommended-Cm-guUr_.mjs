import { t as got_default } from "./got-Dnzt41dd.mjs";
import { i as queryToInteger, t as fallback } from "./readable-social-DP5kGwF5.mjs";
import { t as renderListDescription } from "./list-description-BIqIiyKy.mjs";
//#region lib/routes/douban/other/recommended.ts
const route = {
	path: "/recommended/:type?/:routeParams?",
	categories: ["social-media"],
	example: "/douban/recommended/tv",
	parameters: {
		type: "片单类型剧集/电影，tv或movie，默认为tv",
		routeParams: "额外参数；请参阅以下说明和表格"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "豆瓣每月推荐片单",
	maintainers: ["honue"],
	handler,
	description: `| 额外参数 | 含义                   | 接受的值 | 默认值 |
| -------- | ---------------------- | -------- | ------ |
| playable | 仅看有可播放片源的影片 | 0/1      | 0      |
| score    | 筛选评分               | 0-10     | 0      |

用例：\`/douban/recommended/tv/playable=0&score=8\`

::: tip
整合了 /douban/list/ 路由，省去每月手动更新 id 参数，因为当月推荐剧集片单中，会有还未播出 / 开评分剧集、海外平台播出剧集，请自行考虑是否使用额外参数。
:::`
};
async function handler(ctx) {
	let url = `https://frodo.douban.com/api/v2/skynet/new_playlists?apikey=0ac44ae016490db2204ce0a042db2916&subject_type=${ctx.req.param("type") || "tv"}`;
	let response = await got_default({
		method: "get",
		url,
		headers: {
			"User-Agent": "MicroMessenger/",
			Referer: "https://servicewechat.com/wx2f9b06c1de1ccfca/91/page-frame.html"
		}
	});
	const date = /* @__PURE__ */ new Date();
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const mon = month < 10 ? "0" + month : month.toString();
	let items = response.data.data[0].items;
	const subjectCollectionId = items.find((item) => item.title.startsWith(`${year}年${mon}月`)).id;
	const routeParams = Object.fromEntries(new URLSearchParams(ctx.req.param("routeParams")));
	const playable = fallback(void 0, queryToInteger(routeParams.playable), 0);
	const score = fallback(void 0, queryToInteger(routeParams.score), 0);
	url = `https://m.douban.com/rexxar/api/v2/subject_collection/${subjectCollectionId}/items?playable=${playable}`;
	response = await got_default({
		method: "get",
		url,
		headers: { Referer: `https://m.douban.com/subject_collection/${subjectCollectionId}` }
	});
	const description = response.data.subject_collection.description;
	items = response.data.subject_collection_items.filter((item) => {
		return (item.rating ? item.rating.value : 0) >= score;
	}).map((item) => {
		const title = item.title;
		return {
			title,
			link: item.url,
			description: renderListDescription({
				ranking_value: item.ranking_value,
				title,
				original_title: item.original_title,
				rate: item.rating ? item.rating.value : null,
				card_subtitle: item.card_subtitle,
				description: item.cards ? item.cards[0].content : item.abstract,
				cover: item.cover_url || item.cover?.url
			})
		};
	});
	return {
		title: `豆瓣 - ${response.data.subject_collection.name}`,
		link: `https://m.douban.com/subject_collection/${subjectCollectionId}`,
		item: items,
		description
	};
}
//#endregion
export { route };
