import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
//#region lib/routes/miniflux/entry.ts
const route = {
	path: "/entry/:feeds/:parameters?",
	description: `1. Support to get all content: You can obtain the content of all subscription sources by using keywords such as \`/miniflux/all\` or \`/miniflux/default\`.
2. Support to get the subscription content of a specific subscription source by its ID. Please obtain the subscription source ID on the page where it is located under \`Sources\` (shortcut keys \`g\` \`f\`). The URL for each category (or subscription source) displays its ID information. There are several format options available:
   1. Support \`/miniflux/feed=[feed_id]\`, please replace \`[feed_id]\` with the actual ID of the subscribed feed (note that it should be just a number without brackets).
   2. Support subscribing to multiple feeds using \`/miniflux/feed=[feed1_id]&feed=[feed2_id]\` or \`/miniflux/feeds=[feed1_id]&[feed2_id]\`.
   3. Additionally, you can use shorthand notation by directly using feed IDs: \`/miniflux/[feed1_id]&[feed2_id]\`.
3. Further customization options are available based on your needs:
   1. All parameters/options provided by MiniFlux are supported ([link](https://miniflux.app/docs/api.html#endpoint-get-feed-entries)). As noted in their documentation, multiple filtering options should be connected with \`&\`. Except for \`status\`, only the first occurrence of duplicate filter options will be considered.
   2. Specifically, this route defaults to sorting entries from new to old (\`direction=desc\`).
   3. Moreover, this route supports additional options including:
      - Using the \`feed_name\` parameter to control title formatting; setting \`feed_name=1\` will display each title as "Article Title | Feed Name," while default is set at \`0\`, showing only article titles.
      - Utilizing the \`mark\` parameter to specify actions after fetching subscriptions in RSSHub, such as maintaining unchanged state (\`unchanged\`, default), marking as read (\`read\`), removing (\`removed\`) or marking as unread (\`unread\`). Note that marking as read should not simply be understood as a means for implementing synchronization services; rather, it functions more like an aid for MiniFlux's automatic cleaning feature.
      - Future support may include utilizing the \`link\` parameter to control output URLs (this functionality requires corresponding interfaces from MiniFlux). It could involve generating URLs through MiniFlux entity sharing features or original content links.
      - The output content quantity can be controlled via the 'limit' parameter; although all matching contents are typically outputted by default, **it is recommended that users set this parameter**.`,
	categories: ["other"],
	example: "/miniflux/feeds=1&2&3/mark=read&limit=7&status=unread",
	parameters: {
		feeds: "Subscribe source ID or get all.",
		parameters: "Filter and set parameters, use `&` to connect multiple."
	},
	features: {
		requireConfig: [{
			name: "MINIFLUX_INSTANCE",
			description: "The instance used by the user, by default, is the official MiniFlux [paid service address](https://reader.miniflux.app)"
		}, {
			name: "MINIFLUX_TOKEN",
			description: "User's API key, please log in to the instance used and go to `Settings` -> `API Key` -> `Create a new API key` to obtain."
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Feed entry",
	maintainers: ["emdoe", "DIYgod"],
	handler
};
async function handler(ctx) {
	let mark = "unchanged";
	let addFeedName = 0;
	let limit = 0;
	const instance = config.miniflux.instance;
	const token = config.miniflux.token;
	if (!token) throw new ConfigNotFoundError("This RSS feed is disabled due to its incorrect configuration: the token is missing.");
	function filterHandler(item) {
		if (item.search("=") === -1) return "";
		const filter = item.slice(0, item.indexOf("="));
		const option = item.slice(item.lastIndexOf("=") + 1);
		switch (filter) {
			case "mark":
				if ([
					"read",
					"removed",
					"unread"
				].includes(option) && !setMark.length) {
					mark = option;
					setMark.push(1);
				}
				item = "";
				break;
			case "feed_name":
				if (Number.parseInt(option) === 1 && !setFeedName.length) {
					addFeedName = 1;
					setFeedName.push(1);
				}
				item = "";
				break;
			case "direction":
				if (option !== "asc") item = "direction=desc";
				break;
			case "category":
				Number.isNaN(Number.parseInt(option)) ? item = "" : item = `category_id=${option}`;
				break;
			case "order":
				if (option !== "id" && option !== "category_title" && option !== "published_at" && option !== "status" && option !== "category_id") item = "";
				break;
			case "limit":
				if (!Number.isNaN(option) && !setLimit.length) {
					limit = option;
					setLimit.push(1);
				}
				item = "";
				break;
			default: break;
		}
		return item;
	}
	const entriesID = [];
	const feedsName = [];
	const articles = [];
	const setLimit = [];
	const setMark = [];
	const setFeedName = [];
	const feeds = ctx.req.param("feeds");
	let parameters = ctx.req.param("parameters");
	if (parameters.search("direction=") === -1) parameters += "&direction=desc";
	parameters = parameters.split("&").map((item) => filterHandler(item)).filter(Boolean).join("&");
	let queryLimit = ctx.req.query("limit");
	let result;
	if (feeds.search(/feeds?=/g) !== -1 || !Number.isNaN(Number.parseInt(feeds.split("&").join("")))) {
		const feedsList = [feeds.replaceAll(/feeds?=/g, "").split("&")].flat();
		if (limit && queryLimit) {
			if (limit >= queryLimit) limit = Number.parseInt(queryLimit / feedsList.length) || 1;
			parameters += `&limit=${limit}`;
		} else if (limit) parameters += `&limit=${limit}`;
		else if (queryLimit) {
			limit = Number.parseInt(queryLimit / feedsList.length) || 1;
			parameters += `&limit=${limit}`;
		}
		await Promise.all(feedsList.map(async (feed) => {
			const entries = (await got_default({
				method: "get",
				url: `${instance}/v1/feeds/${feed}/entries?${parameters}`,
				headers: { "X-Auth-Token": token }
			})).data.entries;
			let getFeedTitle = 0;
			for (const entry of entries) {
				entriesID.push(entry.id);
				if (!getFeedTitle) {
					feedsName.push(entry.feed.title);
					getFeedTitle = 1;
				}
				let entryTitle = entry.title;
				if (addFeedName) entryTitle += ` | ${entry.feed.title}`;
				articles.push({
					title: entryTitle,
					author: entry.author,
					pubDate: entry.published_at,
					description: entry.content,
					link: entry.url
				});
			}
		}));
		const feedsNumber = feedsName.length;
		let agTitle, agInfo;
		if (feedsNumber > 2) {
			agTitle = `MiniFlux | Aggregator For ${feedsNumber} Feeds`;
			agInfo = `An aggregator powered by MiniFlux and RSSHub. This aggregator truthfully preserves the contents in ${feedsNumber} feeds, including: <li>${feedsName.join("<li></li>")}</li>`;
		} else if (feedsNumber) {
			agTitle = `MiniFlux | ${feedsName.join(", ")}`;
			agInfo = `A RSS feed powered by MiniFlux and RSSHub effortlessly republishes the contents in "${feedsName.join("\" & \"")}".`;
		} else {
			agTitle = "MiniFlux | Feeds Aggregator";
			agInfo = "An aggregator powered by MiniFlux and RSSHub with empty content. If this is not your intention, please double-check your setting for parameters.";
		}
		result = {
			title: agTitle,
			link: instance,
			description: agInfo,
			item: articles,
			allowEmpty: true
		};
	} else {
		if (limit && queryLimit) {
			if (limit < queryLimit) queryLimit = limit;
			parameters += `&limit=${queryLimit}`;
		} else if (queryLimit) parameters += `&limit=${queryLimit}`;
		else if (limit) parameters += `&limit=${limit}`;
		const entries = (await got_default.get(`${instance}/v1/entries?${parameters}`, { headers: { "X-Auth-Token": token } })).data.entries;
		const articles = [];
		for (const entry of entries) {
			entriesID.push(entry.id);
			let entryTitle = entry.title;
			if (addFeedName) entryTitle += ` | ${entry.feed.title}`;
			articles.push({
				title: entryTitle,
				author: entry.author,
				pubDate: entry.published_at,
				description: entry.content,
				link: entry.url
			});
		}
		result = {
			title: "MiniFlux | All",
			link: instance,
			description: `All feeds on ${instance} powered by MiniFlux`,
			item: articles,
			allowEmpty: true
		};
	}
	if (mark !== "unchanged") got_default({
		method: "put",
		url: `${instance}/v1/entries`,
		headers: {
			"Content-Type": "application/json",
			"X-Auth-Token": token
		},
		json: {
			entry_ids: entriesID,
			status: mark
		}
	});
	return result;
}
//#endregion
export { route };
