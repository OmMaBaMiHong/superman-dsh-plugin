import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { load } from "cheerio";
//#region lib/routes/bugzilla/bug.ts
const INSTANCES = /* @__PURE__ */ new Map([
	["apache", "bz.apache.org/bugzilla"],
	["apache.ooo", "bz.apache.org/ooo"],
	["apache.SpamAssassin", "bz.apache.org/SpamAssassin"],
	["kernel", "bugzilla.kernel.org"],
	["mozilla", "bugzilla.mozilla.org"],
	["webkit", "bugs.webkit.org"]
]);
async function handler(ctx) {
	const { site, bugId } = ctx.req.param();
	if (!INSTANCES.has(site)) throw new InvalidParameterError(`unknown site: ${site}`);
	const link = `https://${INSTANCES.get(site)}/show_bug.cgi?id=${bugId}`;
	const $ = load(await rofetch(`${link}&ctype=xml`));
	const items = $("long_desc").map((index, rawItem) => {
		const $ = load(rawItem, null, false);
		return {
			title: `comment #${$("commentid").text()}`,
			link: `${link}#c${index}`,
			description: $("thetext").text(),
			pubDate: parseDate($("bug_when").text()),
			author: $("who").attr("name")
		};
	});
	return {
		title: $("short_desc").text(),
		link,
		item: items.toArray()
	};
}
function markdownFrom(instances, separator = ", ") {
	return [...instances].map(([k, v]) => `[\`${k}\`](https://${v})`).join(separator);
}
const route = {
	path: "/bug/:site/:bugId",
	name: "bugs",
	maintainers: ["FranklinYu"],
	handler,
	example: "/bugzilla/bug/webkit/251528",
	parameters: {
		site: "site identifier",
		bugId: "numeric identifier of the bug in the site"
	},
	description: `Supported site identifiers: ${markdownFrom(INSTANCES)}.`,
	categories: ["programming"],
	zh: {
		name: "bugs",
		description: `支持的站点标识符：${markdownFrom(INSTANCES, "、")}。`
	}
};
//#endregion
export { route };
