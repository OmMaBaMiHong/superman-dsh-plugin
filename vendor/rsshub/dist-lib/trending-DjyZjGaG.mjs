import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { n as getNextBuildId, t as baseUrl } from "./utils-CzDMMvsQ.mjs";
//#region lib/routes/makerworld/trending.ts
const route = {
	path: "/trending",
	categories: ["design"],
	example: "/makerworld/trending",
	name: "Trending Models",
	maintainers: ["TonyRL"],
	handler,
	radar: [{ source: ["makerworld.com/:lang"] }]
};
async function handler() {
	const items = (await rofetch(`${baseUrl}/_next/data/${await getNextBuildId()}/en.json`, { headers: { "User-Agent": config.trueUA } })).pageProps.popularDesignsData.map((d) => ({
		title: d.title,
		link: `${baseUrl}/en/models/${d.id}-${d.slug}`,
		author: d.designCreator.name,
		category: d.tags,
		pubDate: parseDate(d.startTime),
		description: d.designExtension.design_pictures.map((i) => `<figure><img src="${i.url}" alt="${d.name}"><figcaption>${i.name}</figcaption></figure>`).join("")
	}));
	return {
		title: "Trending Models - MakerWorld",
		description: "Leading 3D printing model community for designers and makers. Download thousands of 3D models and stl models for free, and your No.1 option for multicolor 3D models",
		link: `${baseUrl}/en`,
		image: `${baseUrl}/favicon_new.png`,
		item: items
	};
}
//#endregion
export { route };
