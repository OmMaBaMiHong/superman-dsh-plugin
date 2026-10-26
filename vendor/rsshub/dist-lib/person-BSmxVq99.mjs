import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/bangumi.tv/person/index.ts
const route = {
	path: "/person/:id",
	categories: ["anime"],
	example: "/bangumi.tv/person/32943",
	parameters: { id: "人物 id, 在人物页面的地址栏查看" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["bgm.tv/person/:id"] }],
	name: "现实人物的新作品",
	maintainers: ["ylc395"],
	handler
};
async function handler(ctx) {
	const link = `https://bgm.tv/person/${ctx.req.param("id")}/works?sort=date`;
	const $ = load(await rofetch(link));
	const personName = $(".nameSingle a").text();
	const works = $(".item").toArray().map((el) => {
		const $el = $(el);
		const $workEl = $el.find(".l");
		return {
			work: $workEl.text(),
			workURL: `https://bgm.tv${$workEl.attr("href")}`,
			workInfo: $el.find("p.info").text(),
			job: $el.find(".badge_job").text()
		};
	});
	return {
		title: `${personName}参与的作品`,
		link,
		item: works.map((c) => {
			const match = c.workInfo.match(/(\d{4}[年-]\d{1,2}[月-]\d{1,2})/);
			return {
				title: `${personName}以${c.job}的身份参与了作品《${c.work}》`,
				description: c.workInfo,
				link: c.workURL,
				pubDate: match ? parseDate(match[1], ["YYYY-MM-DD", "YYYY-M-D"]) : null
			};
		})
	};
}
//#endregion
export { route };
