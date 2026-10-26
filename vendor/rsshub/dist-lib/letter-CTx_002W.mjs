import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as fetchUserDate, t as baseUrl } from "./utils-BHHHKXKg.mjs";
//#region lib/routes/zhiy/letter.ts
const route = {
	path: "/letters/:author",
	categories: ["new-media"],
	example: "/zhiy/letters/messy",
	parameters: { author: "作者 ID，可在URL中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["zhiy.cc/:author"] }],
	name: "Newsletter",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const author = ctx.req.param("author");
	const { author_id: authorId, author_name: authorName, author_signature: authorSignature, author_avatar_url: authorAvatarUrl } = await fetchUserDate(author);
	const { data: { result: letters } } = await got_default(`${baseUrl}/api/app/users/${authorId}/letters`, { searchParams: {
		page: 1,
		limit: ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 100
	} });
	const items = letters.map((item) => ({
		title: item.title,
		description: item.shortcut,
		pubDate: parseDate(item.send_time, "X"),
		link: `${baseUrl}/letter/${item.id}`
	}));
	return {
		title: authorName,
		link: `${baseUrl}/${author}`,
		description: authorSignature,
		image: authorAvatarUrl,
		item: items
	};
}
//#endregion
export { route };
