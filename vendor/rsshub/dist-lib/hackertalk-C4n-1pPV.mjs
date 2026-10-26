import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import markdownit from "markdown-it";
//#region lib/routes/hackertalk/index.ts
const md = markdownit();
const route = {
	path: "/",
	radar: [{
		source: ["hackertalk.net/"],
		target: ""
	}],
	name: "Unknown",
	maintainers: ["hyoban"],
	handler,
	url: "hackertalk.net/"
};
async function handler(ctx) {
	return {
		title: "黑客说的最新帖子",
		link: "https://hackertalk.net/?tab=new",
		description: "黑客说 - 技术驱动优质交流",
		item: (await got_default(`https://api.hackertalk.net/v1/posts?limit=${ctx.req.query("limit") ?? 25}&orderBy=time`)).data.data.map((item) => ({
			title: item.title,
			description: md.render(item.content),
			pubDate: parseDate(item.createdAt),
			link: `https://hackertalk.net/posts/${item.id}`
		}))
	};
}
//#endregion
export { route };
