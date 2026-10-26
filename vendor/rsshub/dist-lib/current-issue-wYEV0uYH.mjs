import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
import sanitizeHtml from "sanitize-html";
//#region lib/routes/sciencedirect/current-issue.ts
const route = {
	path: "/journal/:id/current",
	categories: ["journal"],
	example: "/sciencedirect/journal/journal-of-financial-economics/current",
	parameters: { id: "Journal id, can be found in URL" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["sciencedirect.com/journal/:id", "sciencedirect.com/"] }],
	name: "Current Issue",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const baseUrl = "https://www.sciencedirect.com";
	const currentUrl = `${baseUrl}/journal/${id}`;
	const $page = load(await rofetch(currentUrl, { headers: { "User-Agent": config.trueUA } }));
	const issueUrl = `${currentUrl}${JSON.parse(JSON.parse($page("script[type=\"application/json\"]").text())).latestIssues.issues[0].uriLookup}`;
	const $issue = load(await rofetch(issueUrl, { headers: { "User-Agent": config.trueUA } }));
	const issueData = JSON.parse(JSON.parse($issue("script[type=\"application/json\"]").text()));
	const titleMetadata = issueData.titleMetadata;
	const currentIssue = issueData.articles.ihp.data;
	const list = currentIssue.issueBody.issueSec.flatMap((section) => section.includeItem.map((item) => ({
		title: item.title,
		link: `${baseUrl}${item.href}`,
		author: item.authors.map((author) => `${author.givenName} ${author.surname}`).join(", "),
		doi: item.doi,
		pubDate: parseDate(item.coverDateStart),
		pii: item.pii
	})));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const abstracts = (await rofetch(`https://www.sciencedirect.com/journal/0304405X/abstract?pii=${item.pii}`, { headers: { "User-Agent": config.trueUA } })).data?.[0]?.abstracts ?? [];
		item.description = abstracts.length === 0 ? "" : abstracts.map((abs) => abs?.html ?? "").filter(Boolean).join("<br/><br/>");
		return item;
	})));
	return {
		title: `${titleMetadata.displayName} | ${currentIssue.volIssueSupplementText}, (${currentIssue.coverDateText}) | ScienceDirect.com by Elsevier`,
		description: sanitizeHtml(titleMetadata.aimsAndScopeV2, {
			allowedTags: [],
			allowedAttributes: {}
		}),
		image: titleMetadata.largeCoverUrl ?? titleMetadata.smallCoverUrl,
		link: issueUrl,
		item: items
	};
}
//#endregion
export { route };
