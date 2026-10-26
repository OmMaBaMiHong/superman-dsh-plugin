import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import markdownit from "markdown-it";
//#region lib/routes/gitee/users/events.ts
const md = markdownit({ html: true });
const route = {
	path: "/events/:username",
	categories: ["programming"],
	example: "/gitee/events/y_project",
	parameters: { username: "用户名" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["gitee.com/:username"] }],
	name: "用户公开动态",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const username = ctx.req.param("username");
	const apiUrl = `https://gitee.com/api/v5/users/${username}/events/public`;
	let items = (await cache_default.tryGet(apiUrl, async () => (await got_default(apiUrl, { searchParams: {
		access_token: config.gitee.access_token ?? void 0,
		limit: ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 100
	} })).data)).map((item) => ({
		title: item.type,
		author: item.actor.login,
		pubDate: parseDate(item.created_at),
		guid: item.id,
		type: item.type,
		repo: item.repo,
		payload: item.payload
	}));
	items = items.map((item) => {
		switch (item.type) {
			case "CommitCommentEvent":
				item.title = `commented on commit ${item.payload.comment.commit_id.slice(0, 7)} in ${item.payload.repository.full_name}`;
				item.description = md.render(item.payload.comment.body);
				item.link = item.payload.comment.html_url;
				break;
			case "CreateEvent":
				item.title = `${item.payload.ref_type} ${item.payload.ref} created in ${item.repo.full_name}`;
				break;
			case "IssueCommentEvent":
				item.title = item.payload.issue.title;
				item.description = md.render(item.payload.comment.body);
				item.link = item.payload.comment.html_url;
				break;
			case "IssueEvent":
				item.title = `${item.payload.action} ${item.payload.title}`;
				item.description = md.render(item.payload.body);
				item.link = item.payload.html_url;
				break;
			case "ProjectCommentEvent":
				item.title = `commented on project ${item.repo.full_name}`;
				item.description = md.render(item.payload.comment.body);
				item.link = item.payload.comment.html_url;
				break;
			case "PullRequestEvent":
				item.title = `${item.payload.action} pull request #${item.payload.number} ${item.payload.title} in ${item.repo.full_name}`;
				item.description = md.render(item.payload.body);
				item.link = item.payload.html_url;
				break;
			case "PushEvent":
				item.title = `committed ${item.payload.commits[0].sha.slice(0, 7)} in ${item.repo.full_name}`;
				item.description = md.render(item.payload.commits[0].message);
				item.link = `http://gitee.com/${item.repo.full_name}/commit/${item.payload.commits[0].sha}`;
				break;
			default: break;
		}
		delete item.type;
		delete item.repo;
		delete item.payload;
		return item;
	});
	return {
		title: `${username} - 公开动态`,
		link: `https://gitee.com/${username}`,
		item: items
	};
}
//#endregion
export { route };
