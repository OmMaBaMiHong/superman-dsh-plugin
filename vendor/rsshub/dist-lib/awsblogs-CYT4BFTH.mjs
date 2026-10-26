import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/amazon/awsblogs.ts
const route = {
	path: "/awsblogs/:locale?",
	name: "Unknown",
	maintainers: ["HankChow"],
	handler
};
async function handler(ctx) {
	const items = (await got_default({ url: `https://aws.amazon.com/api/dirs/items/search?item.directoryId=blog-posts&sort_by=item.additionalFields.createdDate&sort_order=desc&size=50&item.locale=${ctx.req.param("locale") ?? "zh_CN"}` })).data.items;
	return {
		title: "AWS Blog",
		link: "https://aws.amazon.com/blogs/",
		description: "AWS Blog 更新",
		item: items && items.map((item) => ({
			title: item.item.additionalFields.title,
			description: item.item.additionalFields.postExcerpt,
			pubDate: parseDate(item.item.dateCreated),
			link: item.item.additionalFields.link,
			author: item.item.additionalFields.contributors
		}))
	};
}
//#endregion
export { route };
