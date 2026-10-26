import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { o as journalMap, t as baseUrl } from "./utils-8wIE3g81.mjs";
import { load } from "cheerio";
import { CookieJar } from "tough-cookie";
//#region lib/routes/nature/cover.ts
const route = {
	path: "/cover",
	categories: ["journal"],
	example: "/nature/cover",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["nature.com/"] }],
	name: "Cover Story",
	maintainers: ["y9c", "pseudoyu"],
	handler,
	url: "nature.com/",
	description: "Subscribe to the cover images of the Nature journals, and get the latest publication updates in time."
};
async function handler() {
	const cookieJar = new CookieJar();
	await got_default("https://www.nature.com", { cookieJar });
	const journals = journalMap.items.filter((j) => j.id).map((j) => ({
		...j,
		link: `${baseUrl}/${j.title}/current-issue`
	}));
	return {
		title: "Nature Covers Story",
		description: "Find out the cover story of some Nature journals.",
		link: baseUrl,
		item: await Promise.all(journals.map((journal) => cache_default.tryGet(journal.link, async () => {
			const { id, name, link } = journal;
			const response = await got_default(link, { cookieJar });
			const $ = load(response.data);
			const { volume, issue } = $("meta[property=\"og:url\"]").attr("content")?.match(/volumes\/(?<volume>\d+)\/issues\/(?<issue>\d+)/)?.groups ?? {};
			const contents = `<div align="center"><img src="${`https://media.springernature.com/full/springer-static/cover-hires/journal/${id}/${volume}/${issue}?as=webp`}" alt="Volume ${volume} Issue ${issue}"></div>`;
			const date = $("title").text().split(",", 2)[1].trim();
			const issueDescription = $("div[data-test=issue-description]").html() ?? "";
			return {
				title: `${name} | Volume ${volume} Issue ${issue}`,
				description: contents + issueDescription,
				link: response.url,
				pubDate: parseDate(date, "MMMM YYYY")
			};
		})))
	};
}
//#endregion
export { route };
