import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { n as queryToBoolean, t as fallback } from "./readable-social-DP5kGwF5.mjs";
import { t as utils_default } from "./utils-BvF-NCI9.mjs";
import querystring from "node:querystring";
//#region lib/routes/misskey/user-timeline.ts
const route = {
	path: "/users/notes/:username/:routeParams?",
	categories: ["social-media"],
	view: 1,
	example: "/misskey/users/notes/support@misskey.io",
	parameters: {
		username: "Misskey username in the format of username@instance.domain",
		routeParams: `
| Key               | Description                             | Accepted Values | Default |
| ----------------- | --------------------------------------- | --------------- | ------- |
| withRenotes       | Include renotes in the timeline         | 0/1/true/false  | false   |
| mediaOnly         | Only return posts containing media      | 0/1/true/false  | false   |
| simplifyAuthor    | Simplify author field in feed items     | 0/1/true/false  | false   |

Note: \`withRenotes\` and \`mediaOnly\` are mutually exclusive and cannot both be set to true.

Examples:
- /misskey/users/notes/mttb2ccp@misskey.io/withRenotes=true
- /misskey/users/notes/mttb2ccp@misskey.io/mediaOnly=true`
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "User timeline",
	maintainers: [
		"siygle",
		"SnowAgar25",
		"HanaokaYuzu"
	],
	handler
};
async function handler(ctx) {
	const username = ctx.req.param("username");
	const [, pureUsername, site] = username.match(/@?(\w+)@(\w+\.\w+)/) || [];
	if (!pureUsername || !site) throw new InvalidParameterError("Provide a valid Misskey username");
	if (!config.feature.allow_user_supply_unsafe_domain && !utils_default.allowSiteList.includes(site)) throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
	const routeParams = querystring.parse(ctx.req.param("routeParams"));
	const withRenotes = fallback(void 0, queryToBoolean(routeParams.withRenotes), false);
	const mediaOnly = fallback(void 0, queryToBoolean(routeParams.mediaOnly), false);
	const simplifyAuthor = fallback(void 0, queryToBoolean(routeParams.simplifyAuthor), false);
	if (withRenotes && mediaOnly) throw new InvalidParameterError("withRenotes and mediaOnly cannot both be true.");
	const { accountData, avatarUrl } = await utils_default.getUserTimelineByUsername(pureUsername, site, {
		withRenotes,
		mediaOnly
	});
	return {
		title: `User timeline for ${username} on ${site}`,
		link: `https://${site}/@${pureUsername}`,
		image: avatarUrl ?? "",
		item: utils_default.parseNotes(accountData, site, simplifyAuthor)
	};
}
//#endregion
export { route };
