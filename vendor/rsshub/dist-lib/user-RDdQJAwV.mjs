import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as ProcessForm, t as ProcessFeed } from "./utils-DfVWtVzE.mjs";
//#region lib/routes/lfsyd/user.ts
const route = {
	path: "/user/:id?",
	radar: [{
		source: ["www.iyingdi.com/tz/people/:id", "www.iyingdi.com/tz/people/:id/*"],
		target: "/user/:id"
	}],
	name: "Unknown",
	maintainers: ["auto-bot-ty"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const rootUrl = "https://www.iyingdi.com";
	const listUrl = "https://api.iyingdi.com/web/user/event-list";
	const form = {
		event_types: "content",
		page: 1,
		size: 15,
		timestamp: "",
		user_id: id
	};
	const { data } = (await got_default({
		method: "post",
		url: listUrl,
		headers: {
			Host: "api.iyingdi.com",
			"Login-Token": "nologin",
			Origin: rootUrl,
			Platform: "pc",
			Referer: `${rootUrl}/tz/people/${id}/postList`
		},
		form: ProcessForm(form)
	})).data;
	const { nickname } = data[0].author;
	const items = await ProcessFeed(cache_default, data.map((item) => ({
		title: item.event_data.title,
		pubDate: parseDate(item.event_data.show_time * 1e3),
		link: `${rootUrl}/tz/post/${item.event_data.post_id}`,
		guid: item.event_data.title,
		postId: item.event_data.post_id
	})));
	return {
		title: `${nickname} - 旅法师营地 `,
		link: `${rootUrl}/tz/people/${id}`,
		item: items
	};
}
//#endregion
export { route };
