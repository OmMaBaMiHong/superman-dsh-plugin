import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
//#region lib/routes/fediverse/timeline.ts
const route = {
	path: "/timeline/:account",
	categories: ["social-media"],
	view: 1,
	example: "/fediverse/timeline/Mastodon@mastodon.social",
	parameters: { account: "username@domain" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Timeline",
	maintainers: ["DIYgod", "pseudoyu"],
	handler
};
const allowedDomain = new Set([
	"mastodon.social",
	"pawoo.net",
	config.mastodon.apiHost
].filter(Boolean));
const activityPubTypes = /* @__PURE__ */ new Set(["application/activity+json", "application/ld+json; profile=\"https://www.w3.org/ns/activitystreams\""]);
async function handler(ctx) {
	const account = ctx.req.param("account");
	const domain = account.split("@", 2)[1];
	const username = account.split("@", 1)[0];
	if (!domain || !username) throw new InvalidParameterError("Invalid account");
	if (!config.feature.allow_user_supply_unsafe_domain && !allowedDomain.has(domain.toLowerCase())) throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
	const requestOptions = { headers: { Accept: "application/ld+json; profile=\"https://www.w3.org/ns/activitystreams\"" } };
	const acc = await rofetch(`https://${domain}/.well-known/webfinger?resource=acct:${account}`, { headers: { Accept: "application/jrd+json" } });
	const jsonLink = acc.links.find((link) => link.rel === "self" && activityPubTypes.has(link.type))?.href;
	const link = acc.links.find((link) => link.rel === "http://webfinger.net/rel/profile-page")?.href;
	const officialFeed = await parser.parseURL(`${link}.rss`);
	if (officialFeed) return {
		title: `${officialFeed.title} (Fediverse@${account})`,
		description: officialFeed.description,
		image: officialFeed.image?.url,
		link: officialFeed.link,
		item: officialFeed.items.map((item) => ({
			title: item.title,
			description: item.content,
			link: item.link,
			pubDate: item.pubDate ? parseDate(item.pubDate) : null,
			guid: item.guid
		}))
	};
	const self = await rofetch(jsonLink, requestOptions);
	const items = (await rofetch((await rofetch(self.outbox, requestOptions)).first, requestOptions)).orderedItems;
	const itemResolvers = [];
	for (const item of items) {
		if (![
			"Announce",
			"Create",
			"Update"
		].includes(item.type)) continue;
		if (typeof item.object === "string") itemResolvers.push((async (item) => {
			item.object = await rofetch(item.object, requestOptions);
			return item;
		})(item));
		else itemResolvers.push(Promise.resolve(item));
	}
	const resolvedItems = await Promise.all(itemResolvers);
	return {
		title: `${self.name || self.preferredUsername} (Fediverse@${account})`,
		description: self.summary,
		image: self.icon?.url || self.image?.url,
		link,
		item: resolvedItems.map((item) => ({
			title: item.object.content.replaceAll(/<[^<]*>/g, ""),
			description: `${item.object.content}\n${item.object.attachment?.map((attachment) => `<img src="${attachment.url}" width="${attachment.width}" height="${attachment.height}" />`).join("\n") || ""}`,
			link: item.object.url,
			pubDate: parseDate(item.published),
			guid: item.id
		}))
	};
}
//#endregion
export { route };
