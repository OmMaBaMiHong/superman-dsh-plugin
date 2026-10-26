import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/xiaote/index.ts
const route = {
	path: "/news",
	categories: ["bbs"],
	example: "/xiaote/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["xiaote.com/"] }],
	name: "首页帖子",
	maintainers: ["wxsimon"],
	handler,
	url: "xiaote.com/"
};
async function handler() {
	const { data } = await got_default.post("https://lcen.xiaote.net//api/graphql/", { json: { query: `
                query ($startCursor: Int) {
                    communities(startCursor: $startCursor) {
                        edges {
                            node {
                                objectId
                                content
                                createdAt
                                imageUrls
                                user {
                                    nickname
                                }
                            }
                        }
                    }
                }
            ` } });
	return {
		title: "小特社区",
		link: "https://xiaote.com/",
		item: data.data.communities.edges.map((node) => {
			const item = node.node;
			let description = item.content;
			if (item.imageUrls) for (const url of item.imageUrls) description += `<img src="${url}">`;
			return {
				title: item.content,
				link: `https://www.xiaote.com/r/${item.objectId}`,
				description,
				pubDate: parseDate(item.createdAt * 1e3),
				author: item.user.nickname
			};
		})
	};
}
//#endregion
export { route };
