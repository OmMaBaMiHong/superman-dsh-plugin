import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
//#region lib/routes/ganjingworld/channel/posts.ts
const route = {
	path: "/channel/posts/:id",
	categories: ["social-media"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	example: "/ganjingworld/channel/posts/1fcahpcut9t3gz4zIvYSJR7qd1cs0c",
	parameters: { id: "Channel ID, can be found in channel url" },
	radar: [{
		source: ["ganjingworld.com"],
		target: "/channel/posts/:id"
	}],
	url: "www.ganjingworld.com",
	name: "posts in a channel",
	maintainers: ["yixiangli2001"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const url = `https://www.ganjingworld.com/channel/${id}?tab=posts`;
	const parsed = await rofetch(`https://gw.ganjingworld.com/v1.0c/social-content/get-owner-posts?owner_id=${id}&start_key=&page_size=48&post_image=true&query=basic,post,owner,comment,view,like,is_liked,share `);
	if (parsed.data.list.length === 0) throw new Error("No posts found for this channel. Please make sure the channel ID is correct and that the channel contains posts.");
	const title = parsed.data.list[0].channel.name;
	const items = parsed.data.list.map((item) => {
		const pubDate = new Date(item.time_scheduled);
		const raw = item.text?.replaceAll("\n", "<br>") || "";
		const textWithMedia = item.media?.length > 0 ? raw + `<figure><img src="${item.media[0].url}"></figure>` : raw;
		return {
			title: item.title,
			link: `https://www.ganjingworld.com/news/${item.id}`,
			pubDate,
			description: textWithMedia
		};
	});
	return {
		title,
		link: url,
		description: `Posts from Ganjing World Channel ${title}`,
		item: items
	};
}
//#endregion
export { route };
