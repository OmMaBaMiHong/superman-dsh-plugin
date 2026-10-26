import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import markdownit from "markdown-it";
//#region lib/routes/github/discussions.ts
const md = markdownit({
	html: true,
	linkify: true
});
const route = {
	path: "/discussion/:user/:repo/:state?/:category?",
	categories: ["programming"],
	example: "/github/discussion/DIYgod/RSSHub",
	parameters: {
		user: "User name",
		repo: "Repo name",
		state: {
			description: "The state of discussions",
			default: "open",
			options: [
				{
					label: "Open",
					value: "open"
				},
				{
					label: "Closed",
					value: "closed"
				},
				{
					label: "Answered",
					value: "answered"
				},
				{
					label: "Unanswered",
					value: "unanswered"
				},
				{
					label: "Locked",
					value: "locked"
				},
				{
					label: "Unlocked",
					value: "unlocked"
				},
				{
					label: "All",
					value: "all"
				}
			]
		},
		category: "Category Name (case-sensitive). Default: `null`."
	},
	features: { requireConfig: [{
		name: "GITHUB_ACCESS_TOKEN",
		description: "GitHub Access Token"
	}] },
	radar: [{
		source: [
			"github.com/:user/:repo/discussions",
			"github.com/:user/:repo/discussions/:id",
			"github.com/:user/:repo"
		],
		target: "/discussion/:user/:repo"
	}],
	name: "Repo Discussions",
	maintainers: ["waynzh"],
	handler
};
async function handler(ctx) {
	if (!config.github || !config.github.access_token) throw new ConfigNotFoundError("GitHub Discussions RSS is disabled due to the lack of <a href=\"https://docs.rsshub.app/deploy/config#route-specific-configurations\">relevant config</a>");
	const { user, repo, limit, state = "open", category = null } = ctx.req.param();
	const { answered, closed, locked } = mapStateToBooleans(state);
	const perPage = Math.min(Number.parseInt(limit) || 100, 100);
	const host = `https://github.com/${user}/${repo}/discussions`;
	const url = "https://api.github.com/graphql";
	let filters = `first: ${perPage}`;
	if (answered !== null) filters += `, answered: ${answered}`;
	if (category !== null) {
		const categoryItem = (await got_default({
			method: "post",
			url,
			headers: { Authorization: `bearer ${config.github.access_token}` },
			json: { query: `
                {
                    repository(owner: "${user}", name: "${repo}") {
                        discussionCategories(first: 25) {
                            nodes {
                                id,
                                name,
                            }
                        },
                    }
                  }
                ` }
		})).data.data.repository.discussionCategories.nodes.find((item) => item.name === category);
		filters += categoryItem?.id ? `, categoryId: "${categoryItem.id}"` : "";
	}
	const data = (await got_default({
		method: "post",
		url,
		headers: { Authorization: `bearer ${config.github.access_token}` },
		json: { query: `
            {
                repository(owner: "${user}", name: "${repo}") {
                    discussions(${filters}) {
                        nodes {
                            title,
                            author {
                                login
                            },
                            createdAt,
                            closed,
                            isAnswered,
                            locked,
                            body,
                            url
                        }
                  },
                }
              }
            ` }
	})).data.data.repository.discussions.nodes.filter((item) => closed === null ? item : item.closed === closed).filter((item) => locked === null ? item : item.locked === locked);
	return {
		allowEmpty: true,
		title: `${user}/${repo} Discussions`,
		link: host,
		item: data.map((item) => ({
			title: item.title,
			author: item.author?.login ?? "ghost",
			description: item.body ? md.render(item.body) : "No description",
			pubDate: parseDate(item.createdAt),
			link: item.url
		}))
	};
}
function mapStateToBooleans(state) {
	let answered = null;
	let closed = null;
	let locked = null;
	switch (state) {
		case "answered":
			answered = true;
			break;
		case "unanswered":
			answered = false;
			break;
		case "closed":
			closed = true;
			break;
		case "open":
			closed = false;
			break;
		case "locked":
			locked = true;
			break;
		case "unlocked":
			locked = false;
			break;
		default: break;
	}
	return {
		answered,
		closed,
		locked
	};
}
//#endregion
export { route };
