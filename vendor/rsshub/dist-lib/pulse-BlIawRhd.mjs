import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as md5 } from "./md5-CpIHIxCO.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/github/pulse.tsx
const route = {
	path: "/pulse/:user/:repo/:period?",
	categories: ["programming"],
	example: "/github/pulse/DIYgod/RSSHub",
	parameters: {
		user: "User name",
		repo: "Repo name",
		period: "Time frame, selected from a repository's Pulse/Insights page. Possible values are: `daily`, `halfweekly`, `weekly`, or `monthly`. Default: `weekly`. If your RSS client supports it, consider aligning the polling frequency of the feed to the period."
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["github.com/:user/:repo/pulse", "github.com/:user/:repo/pulse/:period"] }],
	name: "Repo Pulse",
	maintainers: ["jameschensmith"],
	handler
};
async function handler(ctx) {
	const { user, repo, period } = ctx.req.param();
	const periods = [
		"daily",
		"halfweekly",
		"weekly",
		"monthly"
	];
	const pulsePeriod = periods.includes(period) ? period : periods[2];
	const link = `https://github.com/${user}/${repo}/pulse/${pulsePeriod}`;
	const { data: pulsePage } = await got_default(link);
	const $ = load(pulsePage);
	const $mainSections = $("main .Layout-main").children();
	const [periodFrom, periodTo] = $mainSections.eq(0).find("h2").text().split("–");
	const overviewItems = $mainSections.eq(1).find("ul ul li").toArray().map((el) => $(el).text());
	const $commitActivity = $mainSections.eq(2);
	let commitActivity;
	const $contributionData = $commitActivity.find(".js-pulse-contribution-data");
	if ($contributionData.length) commitActivity = (await got_default(`https://github.com${$contributionData.attr("data-pulse-diffstat-summary-url")}`)).data;
	else commitActivity = $commitActivity.text();
	const $githubActivity = $mainSections.eq(3);
	let githubActivity;
	const $sections = $githubActivity.find("h3");
	if ($sections.length) githubActivity = $sections.toArray().map((section) => {
		const $section = $(section);
		const $sectionSiblings = $section.nextUntil("h3");
		const $paragraph = $section.nextUntil("ul");
		const $list = $sectionSiblings.last();
		return {
			heading: $section.text(),
			paragraph: $paragraph.length > 0 ? $paragraph.text() : void 0,
			items: $list.children().toArray().map((item) => {
				const $item = $(item);
				const $link = $item.find("a");
				const $details = $item.find("p");
				const $relativeTime = $details.find("relative-time");
				$relativeTime.replaceWith($relativeTime.attr("datetime"));
				return {
					link: {
						text: $link.text(),
						url: $link.attr("href")
					},
					details: $details.text()
				};
			})
		};
	});
	return {
		title: `${user}/${repo} ${pulsePeriod} Pulse`,
		link,
		item: [{
			guid: md5(`${user}${repo}${period}${periodFrom}${periodTo}`),
			title: `${periodFrom} - ${periodTo}`,
			description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("h2", { children: "Overview" }),
				/* @__PURE__ */ jsx("ul", { children: overviewItems.map((item) => /* @__PURE__ */ jsx("li", { children: item })) }),
				commitActivity ? raw(commitActivity) : null,
				(githubActivity ?? []).map((activity) => /* @__PURE__ */ jsxs(Fragment, { children: [
					/* @__PURE__ */ jsx("h2", { children: activity.heading }),
					activity.paragraph ? /* @__PURE__ */ jsx("p", { children: activity.paragraph }) : null,
					/* @__PURE__ */ jsx("ul", { children: activity.items.map((item) => /* @__PURE__ */ jsxs("li", { children: [/* @__PURE__ */ jsx("a", {
						href: item.link.url,
						children: item.link.text
					}), /* @__PURE__ */ jsx("p", { children: item.details })] })) })
				] }))
			] })),
			pubDate: parseDate(periodTo)
		}]
	};
}
//#endregion
export { route };
