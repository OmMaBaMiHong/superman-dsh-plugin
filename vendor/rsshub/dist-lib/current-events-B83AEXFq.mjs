import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/wikipedia/current-events.ts
function getCurrentEventsDatePath(date) {
	return `Portal:Current_events/${date.getFullYear()}_${[
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December"
	][date.getMonth()]}_${date.getDate()}`;
}
function parseCurrentEventsTemplate(wikitext) {
	if (!wikitext || typeof wikitext !== "string") return null;
	const contentMatch = wikitext.match(/\{\{Current events\s*\|[\s\S]*?content(?=(\s*=))\1\s*((?:\S[\s\S]*)?)\}\}$/);
	if (!contentMatch) return null;
	let content = contentMatch[2].trim();
	content = stripComments(content);
	if (/^\s*\*+\s*$/.test(content)) return null;
	return content;
}
function stripTemplates(wikitext) {
	return wikitext.replaceAll(/\{\{([^}]+)\}\}/g, "$1");
}
function convertWikiLinks(html) {
	html = html.replaceAll(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, "<a href=\"https://en.wikipedia.org/wiki/$1\">$2</a>");
	html = html.replaceAll(/\[\[([^\]]+)\]\]/g, "<a href=\"https://en.wikipedia.org/wiki/$1\">$1</a>");
	return html;
}
function convertExternalLinks(html) {
	html = html.replaceAll(/\[([^\s\]]+)\s+([^\s\]][^\]]*|\s)\]/g, "<a href=\"$1\">$2</a>");
	html = html.replaceAll(/\[([^\s\]]+)\]/g, "<a href=\"$1\">$1</a>");
	return html;
}
function convertTextFormatting(html) {
	html = html.replaceAll(/'''([^']+)'''/g, "<strong>$1</strong>");
	html = html.replaceAll(/''([^']+)''/g, "<em>$1</em>");
	return html;
}
function createListProcessorState() {
	return {
		result: [],
		depthStack: [],
		lastDepth: 0
	};
}
function addIndentedTag(state, tag) {
	state.result.push("  ".repeat(state.depthStack.length) + tag);
}
function closeAllListsAndAddParagraph(state) {
	while (state.depthStack.length > 0) {
		state.depthStack.pop();
		addIndentedTag(state, "</ul>");
		if (state.depthStack.length > 0) addIndentedTag(state, "</li>");
	}
	state.lastDepth = 0;
}
function openNestedLists(state, targetDepth) {
	for (let d = state.lastDepth; d < targetDepth; d++) {
		addIndentedTag(state, "<ul>");
		state.depthStack.push(d + 1);
	}
}
function closeNestedLists(state, targetDepth) {
	while (state.depthStack.length > 0 && state.depthStack.at(-1) > targetDepth) {
		addIndentedTag(state, "</li>");
		state.depthStack.pop();
		addIndentedTag(state, "</ul>");
		if (state.depthStack.length > 0 && state.depthStack.at(-1) > targetDepth) {} else if (state.depthStack.length > 0) addIndentedTag(state, "</li>");
	}
}
function closePreviousListItem(state) {
	if (state.depthStack.length > 0) addIndentedTag(state, "</li>");
}
function closeAllOpenLists(state) {
	if (state.depthStack.length === 0) return;
	addIndentedTag(state, "</li>");
	state.depthStack.pop();
	while (state.depthStack.length > 0) {
		state.result.push("  ".repeat(state.depthStack.length) + "</ul>", "  ".repeat(state.depthStack.length) + "</li>");
		state.depthStack.pop();
	}
	state.result.push("</ul>");
}
function processListsAndLines(html) {
	const lines = html.split("\n");
	const state = createListProcessorState();
	for (const line of lines) {
		const trimmedLine = line.trim();
		if (!trimmedLine) {
			closeAllListsAndAddParagraph(state);
			continue;
		}
		const bulletMatch = trimmedLine.match(/^(\*+)(?!\*)\s*((?:\S.*)?)$/);
		if (bulletMatch) {
			const depth = bulletMatch[1].length;
			const content = bulletMatch[2];
			if (!content) continue;
			if (depth > state.lastDepth) openNestedLists(state, depth);
			else if (depth < state.lastDepth) closeNestedLists(state, depth);
			else closePreviousListItem(state);
			addIndentedTag(state, `<li>${content}`);
			state.lastDepth = depth;
		} else {
			closeAllListsAndAddParagraph(state);
			state.result.push(trimmedLine);
		}
	}
	closeAllOpenLists(state);
	return state.result.join("\n");
}
function stripComments(html) {
	return html.replaceAll(/<!--[\s\S]*?-->/g, "");
}
function wikiToHtml(wikitext) {
	let html = wikitext;
	html = stripTemplates(html);
	html = convertWikiLinks(html);
	html = convertExternalLinks(html);
	html = convertTextFormatting(html);
	html = processListsAndLines(html);
	return html;
}
async function fetchMultipleWikiContent(pageNames) {
	const url = "https://en.wikipedia.org/w/api.php";
	const titles = pageNames.join("|");
	const results = {};
	let continueParams = {};
	let hasMore = true;
	while (hasMore) {
		const response = await got_default(url, {
			searchParams: {
				action: "query",
				format: "json",
				titles,
				prop: "revisions",
				rvprop: "content",
				rvslots: "main",
				...continueParams
			},
			headers: { "User-Agent": config.trueUA }
		});
		const data = JSON.parse(response.body);
		if (data.query && data.query.pages) for (const page of Object.values(data.query.pages)) {
			if (!(page.revisions && page.revisions[0] && page.revisions[0].slots && page.revisions[0].slots.main)) continue;
			const wikitext = page.revisions[0].slots.main["*"];
			const content = parseCurrentEventsTemplate(wikitext);
			if (content) {
				const html = wikiToHtml(content);
				const normalizedTitle = page.title.replace(/Portal:Current events\/(\d{4}) (\w+) (\d+)/, "Portal:Current_events/$1_$2_$3");
				results[normalizedTitle] = html;
			}
		}
		if (data.continue) continueParams = data.continue;
		else hasMore = false;
	}
	return results;
}
const route = {
	path: "/current-events/:includeToday?",
	categories: ["new-media"],
	example: "/wikipedia/current-events",
	parameters: { includeToday: {
		description: "Include current day events (may be incomplete early in the day)",
		default: "auto",
		options: [
			{
				label: "Auto (include after 18:00 UTC)",
				value: "auto"
			},
			{
				label: "Always include current day",
				value: "always"
			},
			{
				label: "Never include current day",
				value: "never"
			},
			{
				label: "Include after specific UTC hour (0-23)",
				value: "0-23"
			}
		]
	} },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["en.wikipedia.org/wiki/Portal:Current_events"],
		target: "/wikipedia/current-events"
	}],
	name: "Current Events",
	maintainers: ["aavanian"],
	handler,
	description: "Wikipedia Portal: Current events - Latest news and events from the past 7 days"
};
async function handler(ctx) {
	const dates = determineDates(ctx.req.param("includeToday") ?? "auto");
	const pageNames = dates.map((date) => getCurrentEventsDatePath(date));
	const cacheKey = "wikipedia:current-events:batch:" + pageNames.join("|");
	try {
		const contentMap = await cache_default.tryGet(cacheKey, async () => await fetchMultipleWikiContent(pageNames), config.cache.contentExpire);
		return {
			title: "Wikipedia: Portal: Current events",
			link: "https://en.wikipedia.org/wiki/Portal:Current_events",
			description: "Current events from Wikipedia - Latest news and events",
			item: dates.map((date) => {
				const pageName = getCurrentEventsDatePath(date);
				const html = contentMap[pageName];
				if (html) {
					const year = date.getFullYear();
					const dateStr = `${year}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
					const endOfDayGMTMinus12 = Date.UTC(year, date.getMonth(), date.getDate() + 1, 11, 59, 59);
					return {
						title: `Current events: ${dateStr}`,
						link: `https://en.wikipedia.org/wiki/${pageName}`,
						description: html,
						pubDate: new Date(Math.min(endOfDayGMTMinus12, Date.now())),
						guid: `wikipedia-current-events-${dateStr}`
					};
				}
				return null;
			}).filter((item) => item !== null)
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new Error(`Failed to fetch Wikipedia current events: ${message}`, { cause: error });
	}
}
function determineDates(includeToday) {
	const currentHourUTC = (/* @__PURE__ */ new Date()).getUTCHours();
	let shouldIncludeToday = false;
	switch (includeToday) {
		case "always":
			shouldIncludeToday = true;
			break;
		case "never":
			shouldIncludeToday = false;
			break;
		case "auto":
			shouldIncludeToday = currentHourUTC >= 18;
			break;
		default: if (/^\d+$/.test(includeToday)) {
			const targetHour = Number(includeToday);
			if (targetHour >= 0 && targetHour <= 23) shouldIncludeToday = currentHourUTC >= targetHour;
		}
	}
	const startOffset = shouldIncludeToday ? 0 : 1;
	return Array.from({ length: 7 }, (_, i) => {
		const date = /* @__PURE__ */ new Date();
		date.setDate(date.getDate() - (i + startOffset));
		return date;
	});
}
//#endregion
export { route, wikiToHtml };
