import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/civitai/models.ts
const route = {
	path: "/models",
	categories: ["program-update"],
	example: "/civitai/models",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	radar: [{ source: ["civitai.com/"] }],
	name: "Latest models",
	maintainers: ["DIYgod"],
	handler,
	url: "civitai.com/"
};
async function handler() {
	const { data } = await got_default("https://civitai.com/api/v1/models", { searchParams: {
		limit: 20,
		sort: "Newest"
	} });
	return {
		title: "Civitai latest models",
		link: "https://civitai.com/",
		item: data.items.map((item) => ({
			title: item.name,
			link: `https://civitai.com/models/${item.id}`,
			description: `${item.modelVersions?.[0]?.images?.map((image) => `<image src="${image.url.replace(/width=\d+\//, () => `width=${image.width}/`)}">`).join("\n")}${item.description}`,
			pubDate: parseDate(item.lastVersionAt),
			author: item.creator?.username,
			category: item.tags
		}))
	};
}
//#endregion
export { route };
