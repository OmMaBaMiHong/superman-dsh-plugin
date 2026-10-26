import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/huoxian/zone.ts
const route = {
	path: "/zone",
	categories: ["bbs"],
	example: "/huoxian/zone",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Zone",
	maintainers: ["p7e4"],
	handler
};
async function handler() {
	const { data } = await got_default("https://zone.huoxian.cn/api/discussions?sort=-createdAt");
	return {
		title: "火线 Zone-安全攻防社区",
		link: "https://zone.huoxian.cn/",
		item: data.data.map((item) => ({
			title: item.attributes.title,
			link: `https://zone.huoxian.cn/d/${item.attributes.slug}`,
			description: data.included.find((i) => i.id === item.relationships.firstPost.data.id).attributes.contentHtml,
			pubDate: parseDate(item.attributes.createdAt),
			author: data.included.find((i) => i.id === item.relationships.user.data.id).attributes.displayName,
			category: data.included.filter((i) => item.relationships.tags.data.map((t) => t.id).includes(i.id) && i.type === "tags").map((i) => i.attributes.name)
		}))
	};
}
//#endregion
export { route };
