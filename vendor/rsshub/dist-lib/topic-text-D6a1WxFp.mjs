import { t as constructTopicEntry } from "./utils-DiNi8v2R.mjs";
import dayjs from "dayjs";
//#region lib/routes/jike/topic-text.ts
const route = {
	path: "/topic/text/:id",
	categories: ["social-media"],
	example: "/jike/topic/text/553870e8e4b0cafb0a1bef68",
	parameters: { id: "圈子 id, 可在即刻 web 端圈子页或 APP 分享出来的圈子页 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["web.okjike.com/topic/:id"],
		target: "/topic/text/:id"
	}, {
		source: ["m.okjike.com/topics/:id"],
		target: "/topic/text/:id"
	}],
	name: "圈子 - 纯文字",
	maintainers: ["HenryQW"],
	handler
};
async function handler(ctx) {
	const data = await constructTopicEntry(ctx, `https://m.okjike.com/topics/${ctx.req.param("id")}`);
	if (data) {
		const result = data.result;
		result.item = data.posts.map((item) => {
			const date = dayjs(item.createdAt);
			return {
				title: `${data.topic.content} ${date.format("MM月DD日")}`,
				description: item.content.replaceAll("\n", "<br>"),
				pubDate: date.toDate(),
				link: `https://m.okjike.com/originalPosts/${item.id}`
			};
		});
		return result;
	}
}
//#endregion
export { route };
