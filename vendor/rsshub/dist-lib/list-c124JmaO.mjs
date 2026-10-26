import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
//#region lib/routes/readwise/list.ts
const route = {
	path: "/list/:routeParams?",
	categories: ["reading"],
	example: "/readwise/list/location=new&category=article",
	parameters: { routeParams: "Parameter combinations, see the description above." },
	features: {
		requireConfig: [{
			name: "READWISE_ACCESS_TOKEN",
			optional: false,
			description: "Visit `https://readwise.io/access_token` to get your access token."
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["read.readwise.io"],
		target: "/list"
	}],
	name: "Reader Document List",
	maintainers: ["xbot"],
	handler,
	description: `Specify options (in the format of query string) in parameter \`routeParams\` to filter documents.

| Parameter      | Description                                                                            | Values                                                                  | Default |
| -------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------- |
| \`location\`     | The document's location.                                                               | \`new\`/\`later\`/\`shortlist\`/\`archive\`/\`feed\`                              |         |
| \`category\`     | The document's category.                                                               | \`article\`/\`email\`/\`rss\`/\`highlight\`/\`note\`/\`pdf\`/\`epub\`/\`tweet\`/\`video\` |         |
| \`updatedAfter\` | Fetch only documents updated after this date.                                          | string (formatted as ISO 8601 date)                                     |         |
| \`tag\`          | The document's tag, can be specified once or multiple times.                           |                                                                         |         |
| \`tagStrategy\`  | If multiple tags are specified, should the documents match all of them or any of them. | \`any\`/\`all\`                                                             | \`any\`   |

Customise parameter values to fetch specific documents, for example:

\`\`\`
https://rsshub.app/readwise/list/location=new&category=article
\`\`\`

fetches articles in the Inbox.

\`\`\`
https://rsshub.app/readwise/list/category=article&tag=shortlist&tag=AI&tagStrategy=all
\`\`\`

fetches articles tagged both by \`shortlist\` and \`AI\`.`
};
const TAG_STRATEGY_ALL = "all";
const TAG_STRATEGY_ANY = "any";
async function handler(ctx) {
	if (!config.readwise || !config.readwise.accessToken) throw new ConfigNotFoundError("Readwise access token is missing");
	let apiUrl = "https://readwise.io/api/v3/list/?";
	let tag, tagStrategy;
	if (ctx.req.param("routeParams")) {
		const urlSearchParams = new URLSearchParams(ctx.req.param("routeParams"));
		const location = urlSearchParams.get("location");
		const category = urlSearchParams.get("category");
		const updatedAfter = urlSearchParams.get("updatedAfter");
		tag = urlSearchParams.get("tag");
		tagStrategy = urlSearchParams.get("tagStrategy") === TAG_STRATEGY_ANY || urlSearchParams.get("tagStrategy") === TAG_STRATEGY_ALL ? urlSearchParams.get("tagStrategy") : TAG_STRATEGY_ANY;
		if (location) apiUrl += `location=${location}&`;
		if (category) apiUrl += `category=${category}&`;
		if (updatedAfter) apiUrl += `updatedAfter=${updatedAfter}&`;
	}
	const fullData = [];
	async function fetchNextPage(url) {
		const response = await rofetch(url, { headers: { Authorization: `Token ${config.readwise.accessToken}` } });
		fullData.push(...response.results);
		if (response.nextPageCursor) await fetchNextPage(apiUrl + `pageCursor=${response.nextPageCursor}`);
	}
	await fetchNextPage(apiUrl);
	return {
		allowEmpty: true,
		title: "Readwise Reader",
		link: "https://read.readwise.io",
		item: fullData.filter((item) => {
			if (!tag) return true;
			const itemTags = item.tags;
			if (!itemTags) return false;
			if (Array.isArray(tag)) {
				if (tagStrategy === TAG_STRATEGY_ANY) return tag.some((t) => Object.values(itemTags).some((tagObj) => tagObj.name === t));
				if (tagStrategy === TAG_STRATEGY_ALL) return tag.every((t) => Object.values(itemTags).some((tagObj) => tagObj.name === t));
			} else {
				const tagName = tag;
				return Object.values(itemTags).some((tagObj) => tagObj.name === tagName);
			}
			return false;
		}).map((item) => ({
			title: item.title,
			link: item.source_url,
			description: item.summary,
			pubDate: parseDate(item.created_at),
			author: item.author
		}))
	};
}
//#endregion
export { route };
