import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/ps/trophy.ts
const route = {
	path: "/trophy/:id",
	categories: ["game"],
	example: "/ps/trophy/DIYgod_",
	parameters: { id: "User ID" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "PlayStation Network user trophy",
	maintainers: ["DIYgod"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const $ = load((await got_default({
		method: "get",
		url: `https://psnprofiles.com/${id}?order=last-trophy`
	})).data);
	const list = $(".zebra tr").filter((element) => $(element).find(".progress-bar span").text() !== "0%").toArray().map((e) => $(e).find(".title").attr("href")).slice(0, 3);
	const items = await Promise.all(list.map(async (item) => {
		const $ = load((await got_default({
			method: "get",
			url: "https://psnprofiles.com" + item + "?order=date&trophies=earned&lang=zh-cn"
		})).data);
		return $(".zebra tr.completed").toArray().map((item) => {
			item = $(item);
			return {
				title: item.find(".title").text() + " - " + $(".page h3").eq(0).text().trim().replace(" Trophies", ""),
				description: `<img src="${item.find(".trophy source").attr("srcset").split(" ", 2)[1]}"><br>${item.find(".title").parent().contents().filter((_, element) => element.nodeType === 3).text().trim()}<br>等级：${{
					Platinum: "白金",
					Gold: "金",
					Silver: "银",
					Bronze: "铜"
				}[item.find("td").eq(5).find("img").attr("title")]}<br>珍贵度：${item.find(".hover-show .typo-top").text()}`,
				link: "https://psnprofiles.com" + item.find(".title").attr("href"),
				pubDate: (/* @__PURE__ */ new Date(+/* @__PURE__ */ new Date(item.find(".typo-top-date nobr").contents().filter((_, element) => element.nodeType === 3).text() + " " + item.find(".typo-bottom-date").text()) + 480 * 60 * 1e3)).toUTCString()
			};
		});
	}));
	let result = [];
	for (const item of items) result = [...result, ...item];
	result = result.toSorted((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
	return {
		title: `${id} 的 PSN 奖杯`,
		link: `https://psnprofiles.com/${id}/log`,
		item: result
	};
}
//#endregion
export { route };
