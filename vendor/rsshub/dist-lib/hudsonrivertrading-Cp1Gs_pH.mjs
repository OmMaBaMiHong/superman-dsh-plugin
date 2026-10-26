import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
//#region lib/routes/hudsonrivertrading/index.ts
const ROOT_URL = "https://www.hudsonrivertrading.com";
const SECTION_LABELS = {
	algo: "Algorithm",
	engineers: "Engineering",
	interns: "Intern Spotlight",
	more: "Hardware, Systems & More"
};
const SECTION_CATEGORY_IDS = {
	algo: 7,
	engineers: 11,
	interns: 16
};
const route = {
	path: "/blog/:section?",
	categories: ["blog"],
	example: "/hudsonrivertrading/blog",
	parameters: { section: {
		description: "Optional section filter",
		options: Object.entries(SECTION_LABELS).map(([value, label]) => ({
			label,
			value
		}))
	} },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.hudsonrivertrading.com/hrtbeat/"] }],
	name: "Tech Blog",
	maintainers: ["johan456789"],
	handler,
	description: `HRT (Hudson River Trading) Tech Blog

| Route | Section |
| ----- | ------- |
| /hudsonrivertrading/blog | All Posts |
${Object.entries(SECTION_LABELS).map(([key, label]) => `| /hudsonrivertrading/blog/${key} | ${label} |`).join("\n")}`
};
async function handler(ctx) {
	const sectionParam = (ctx.req.param("section") ?? "").toLowerCase();
	const apiBase = `${ROOT_URL}/wp-json/wp/v2`;
	let categoriesQuery;
	if (sectionParam) if (Object.hasOwn(SECTION_CATEGORY_IDS, sectionParam)) categoriesQuery = { include: SECTION_CATEGORY_IDS[sectionParam] };
	else if (sectionParam === "more") categoriesQuery = { exclude: Object.values(SECTION_CATEGORY_IDS) };
	else throw new InvalidParameterError(`Invalid section: ${sectionParam}. Valid sections are: ${Object.keys(SECTION_LABELS).join(", ")}`);
	const searchParams = ["per_page=20", "_embed=author,wp:term"];
	if (categoriesQuery?.include) searchParams.push(`categories=${categoriesQuery.include}`);
	if (categoriesQuery?.exclude?.length) searchParams.push(`categories_exclude=${categoriesQuery.exclude.join(",")}`);
	const items = (await rofetch(`${apiBase}/posts?${searchParams.join("&")}`)).map((post) => ({
		title: post.title?.rendered,
		description: post.content?.rendered ?? post.excerpt?.rendered ?? "",
		link: post.link,
		pubDate: parseDate(post.date_gmt ?? post.date),
		author: post._embedded?.author?.[0]?.name,
		category: Array.isArray(post._embedded?.["wp:term"]) ? post._embedded["wp:term"].flat().map((term) => term?.name).filter(Boolean) : void 0
	}));
	return {
		title: `Hudson River Trading${sectionParam && Object.hasOwn(SECTION_LABELS, sectionParam) ? ` - ${SECTION_LABELS[sectionParam]}` : ""}`,
		link: `${ROOT_URL}/hrtbeat/#${sectionParam}`,
		language: "en",
		item: items
	};
}
//#endregion
export { route };
