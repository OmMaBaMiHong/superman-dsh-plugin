import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
//#region lib/routes/sspai/author.ts
async function getUserId(slug) {
	const response = await got_default({
		method: "get",
		url: `https://sspai.com/api/v1/user/slug/info/get?slug=${slug}`,
		headers: { Referer: `https://sspai.com/u/${slug}/posts` }
	});
	if (response.data.error !== 0) throw new InvalidParameterError("User Not Found");
	return response.data.data.id;
}
const route = {
	path: "/author/:id",
	categories: ["new-media"],
	example: "/sspai/author/796518",
	parameters: { id: "作者 slug 或 id，slug 可在作者主页URL中找到，id 不易查找，仅作兼容" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["sspai.com/u/:id/posts"] }],
	name: "作者",
	maintainers: ["SunShinenny", "hoilc"],
	handler
};
async function handler(ctx) {
	const data = (await got_default({
		method: "get",
		url: `https://sspai.com/api/v1/articles?offset=0&limit=20&author_ids=${/^\d+$/.test(ctx.req.param("id")) ? ctx.req.param("id") : await getUserId(ctx.req.param("id"))}&include_total=false`
	})).data.list;
	const author_slug = data[0].author.slug;
	const author_nickname = data[0].author.nickname;
	const items = await Promise.all(data.map((item) => {
		const link = `https://sspai.com/api/v1/article/info/get?id=${item.id}&view=second&support_webp=true`;
		let description = "";
		const key = `sspai: ${item.id}`;
		return cache_default.tryGet(key, async () => {
			const articleData = (await got_default(link)).data.data;
			const banner = articleData.promote_image;
			if (banner) description = `<img src="${banner}" alt="Article Cover Image" style="display: block; margin: 0 auto;"><br>`;
			description += articleData.body;
			return {
				title: item.title.trim(),
				description,
				link: `https://sspai.com/post/${item.id}`,
				pubDate: parseDate(item.released_at * 1e3),
				author: item.author.nickname
			};
		});
	}));
	return {
		title: `${author_nickname} - 少数派作者`,
		link: `https://sspai.com/u/${author_slug}/posts`,
		description: `${author_nickname} 更新推送 `,
		item: items
	};
}
//#endregion
export { route };
