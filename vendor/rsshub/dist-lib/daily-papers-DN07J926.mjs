import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/huggingface/daily-papers.ts
const route = {
	path: "/daily-papers/:cycle?/:voteFliter?",
	categories: ["programming"],
	example: "/huggingface/daily-papers/week/50",
	parameters: {
		cycle: "The publication cycle you want to follow. Choose from: date, week, month. Default: date",
		voteFliter: "Filter papers by vote count."
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["huggingface.co/papers/:cycle"],
		target: "/daily-papers/:cycle"
	}],
	name: "Daily Papers",
	maintainers: ["zeyugao", "ovo-tim"],
	handler,
	url: "huggingface.co/papers"
};
async function handler(ctx) {
	const { cycle = "date", voteFliter = "0" } = ctx.req.param();
	let url;
	switch (cycle) {
		case "date":
			url = "https://huggingface.co/papers";
			break;
		case "week":
			url = `https://huggingface.co/papers/week/${(/* @__PURE__ */ new Date()).getFullYear()}-W52`;
			break;
		case "month":
			url = `https://huggingface.co/papers/month/${(/* @__PURE__ */ new Date()).toISOString().slice(0, 7)}`;
			break;
		default: throw new Error(`Invalid cycle: ${cycle}`);
	}
	const { body: response } = await got_default(url);
	return {
		allowEmpty: true,
		title: "Huggingface Daily Papers",
		link: "https://huggingface.co/papers",
		item: load(response)("div[data-target=\"DailyPapers\"]").data("props").dailyPapers.filter((item) => item.paper.upvotes >= voteFliter).map((item) => ({
			title: item.title,
			link: `https://arxiv.org/abs/${item.paper.id}`,
			description: item.paper.summary.replaceAll("\n", " "),
			pubDate: parseDate(item.publishedAt),
			author: item.paper.authors.map((author) => author.name).join(", "),
			upvotes: item.paper.upvotes
		})).toSorted((a, b) => b.upvotes - a.upvotes)
	};
}
//#endregion
export { route };
