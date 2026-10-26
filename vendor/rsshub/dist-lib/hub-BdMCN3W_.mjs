import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { a as parseItem, i as parseEventDetail, n as baseUrl, r as getTagsData, t as apiHost } from "./utils-Dptug5tf.mjs";
import { load } from "cheerio";
//#region lib/routes/baai/hub.ts
const route = {
	path: "/hub/:tagId?/:sort?/:range?",
	categories: ["programming"],
	example: "/baai/hub",
	parameters: {
		tagId: "社群 ID，可在 [社群页](https://hub.baai.ac.cn/taglist) 或 URL 中找到",
		sort: "排序，见下表，默认为 `new`",
		range: "时间跨度，仅在排序 `readCnt` 时有效"
	},
	description: `排序

| 最新 | 最热    |
| ---- | ------- |
| new  | readCnt |

时间跨度

| 3 天 | 本周 | 本月 |
| ---- | ---- | ---- |
| 3    | 7    | 30   |`,
	radar: [{
		source: ["baai.ac.cn/"],
		target: (_params, url) => {
			const searchParams = new URL(url).searchParams;
			const tagId = searchParams.get("tag_id");
			const sort = searchParams.get("sort");
			const range = searchParams.get("time_range");
			return `/baai/hub${tagId ? `/${tagId}` : ""}${sort ? `/${sort}` : ""}${range ? `/${range}` : ""}`;
		}
	}],
	name: "智源社区",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const { tagId = "", sort = "new", range } = ctx.req.param();
	let title, description, brief, iconUrl;
	if (tagId) {
		const tag = (await getTagsData()).find((tag) => tag.id === tagId);
		if (tag) {
			title = tag.title;
			description = tag.description;
			brief = tag.brief;
			iconUrl = tag.iconUrl;
		} else throw new InvalidParameterError("Tag not found");
	}
	const list = (await rofetch(`${apiHost}/api/v1/story/list`, {
		method: "POST",
		query: {
			page: 1,
			sort,
			tag_id: tagId,
			time_range: range
		}
	})).data.map((item) => parseItem(item));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		if (item.eventId) item.description = await parseEventDetail(item);
		else {
			const $ = load(await rofetch(item.link));
			item.description = item.is_event ? $("div.box2").html() : $(".post-content").html();
		}
		return item;
	})));
	return {
		title: `${title ? `${title} - ` : ""}${description ? `${description} - ` : ""}智源社区`,
		description: brief,
		link: `${baseUrl}/?${tagId ? `tag_id=${tagId}&` : ""}sort=${sort}${range ? `&time_range=${range}` : ""}`,
		image: iconUrl,
		item: items
	};
}
//#endregion
export { route };
