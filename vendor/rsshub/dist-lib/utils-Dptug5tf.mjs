import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { destr } from "destr";
//#region lib/routes/baai/utils.ts
const baseUrl = "https://hub.baai.ac.cn";
const eventUrl = "https://event.baai.ac.cn";
const apiHost = "https://hub-api.baai.ac.cn";
const getTagsData = () => cache_default.tryGet("baai:tags", async () => {
	const { data } = await rofetch(`${apiHost}/api/v1/tags`);
	return data.map((item) => ({
		id: item.id,
		title: item.title,
		description: item.description,
		brief: item.brief,
		iconUrl: item.icon_url
	}));
});
const parseItem = (item) => ({
	link: item.is_event ? `${eventUrl}/activities/${item.event_info.id}` : `${baseUrl}/view/${item.story_id}`,
	title: item.is_event ? item.event_info.name : item.story_info.title,
	pubDate: timezone(parseDate(item.is_event ? item.event_info.time_desc : item.story_info.created_at.replace("发布", "").replace("分享", "")), 8),
	author: item.is_event ? item.event_info.company : item.story_info.user_name,
	category: item.is_event ? null : item.story_info.tag_names.map((tag) => tag.title),
	eventId: item.is_event ? item.event_info.id : null
});
const parseEventDetail = async (item) => {
	const data = await rofetch(`${eventUrl}/api/api/Activity/IntroductionTypes`, {
		query: { activityId: item.eventId },
		parseResponse: (txt) => destr(txt)
	});
	return data.data.ac_desc + data.data.ac_desc_two;
};
//#endregion
export { parseItem as a, parseEventDetail as i, baseUrl as n, getTagsData as r, apiHost as t };
