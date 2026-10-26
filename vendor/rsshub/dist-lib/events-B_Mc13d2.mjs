import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { a as parseItem, i as parseEventDetail, n as baseUrl, t as apiHost } from "./utils-Dptug5tf.mjs";
//#region lib/routes/baai/events.ts
const route = {
	path: "/hub/events",
	categories: ["programming"],
	example: "/baai/hub/events",
	radar: [{ source: ["hub.baai.ac.cn/events", "hub.baai.ac.cn/"] }],
	name: "智源社区 - 活动",
	maintainers: ["TonyRL"],
	handler,
	url: "hub.baai.ac.cn/events"
};
async function handler() {
	const list = (await rofetch(`${apiHost}/api/v1/events`, {
		method: "POST",
		body: {
			page: 1,
			tag_id: ""
		}
	})).data.map((item) => parseItem(item));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = await parseEventDetail(item);
		return item;
	})));
	return {
		title: "活动 - 智源社区",
		link: `${baseUrl}/events`,
		item: items
	};
}
//#endregion
export { route };
