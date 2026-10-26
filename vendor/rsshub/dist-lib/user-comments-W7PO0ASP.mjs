import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/mit/scratch/user-comments.ts
const route = {
	path: "/scratch/user-comments/:username",
	categories: ["social-media"],
	example: "/mit/scratch/user-comments/skota11",
	parameters: { username: "Scratch username" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["scratch.mit.edu/users/:username/"],
		target: "/scratch/user-comments/:username"
	}],
	name: "Scratch User Comments",
	maintainers: ["Skota11"],
	handler: async (ctx) => {
		const { username } = ctx.req.param();
		const profileUrl = `https://scratch.mit.edu/users/${username}/`;
		const $ = load(await rofetch(`https://scratch.mit.edu/site-api/comments/user/${username}/`, { headers: { "X-Requested-With": "XMLHttpRequest" } }));
		const items = $(".comment").toArray().map((el) => {
			const comment = $(el);
			const author = comment.find(".name a").first().text().trim();
			const contentHtml = comment.find(".content").html()?.trim() || "";
			const textContent = comment.find(".content").text().trim();
			const commentId = comment.attr("data-comment-id");
			const timestamp = comment.find(".time").attr("title");
			return {
				title: textContent,
				author,
				description: contentHtml,
				pubDate: timestamp ? parseDate(timestamp) : void 0,
				link: `${profileUrl}#comments-${commentId}`,
				guid: `scratch-comment-${commentId}`
			};
		});
		return {
			title: `Scratch User Comments - ${username}`,
			link: profileUrl,
			item: items
		};
	}
};
//#endregion
export { route };
