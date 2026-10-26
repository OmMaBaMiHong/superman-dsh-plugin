import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { load } from "cheerio";
//#region lib/routes/hanime1/previews.ts
const route = {
	path: "/previews/:date?",
	name: "每月新番",
	maintainers: ["kjasn"],
	example: "/hanime1/previews/202504",
	categories: ["anime"],
	parameters: { date: { description: "日期格式为 `YYYYMM`，默认值当月" } },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	radar: [{
		source: ["hanime1.me/previews/:date", "hanime1.me/previews"],
		target: "/previews/:date"
	}],
	handler: async (ctx) => {
		const baseUrl = "https://hanime1.me";
		let { date } = ctx.req.param();
		if (!date) {
			const now = /* @__PURE__ */ new Date();
			const year = now.getFullYear();
			const month = now.getMonth() + 1;
			date = `${year}${month >= 10 ? month : "0" + month}`;
		}
		const link = `${baseUrl}/previews/${date}`;
		const $ = load(await rofetch(link, { headers: {
			referer: baseUrl,
			"user-agent": config.trueUA
		} }));
		const items = $(".content-padding .row").toArray().map((el) => {
			const row = $(el);
			const title = row.find(".preview-info-content h4").first().text().trim();
			const previewImageSrc = row.find(".preview-info-cover img").attr("src") || "";
			const rawDate = row.find(".preview-info-cover div").text().trim();
			const modalSelector = row.find(".trailer-modal-trigger").attr("data-target") || "";
			const previewVideoLink = modalSelector ? $(`${modalSelector} video source`).attr("src") || "" : "";
			return {
				title,
				description: `
                    <p>${row.find(".caption").first().text().trim()} </p>
                    <p>Tags: [${row.find(".single-video-tag a").toArray().map((tag) => $(tag).text().trim()).join(", ")}]</p>
                    <video controls width="100%" poster="${previewImageSrc}">
                        <source src="${previewVideoLink}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                    `,
				enclosure_url: previewImageSrc,
				enclosure_type: "image/jpeg",
				link: previewVideoLink,
				guid: `hanime1-${rawDate}-${title}`
			};
		});
		return {
			title: `Hanime1 ${date} 新番`,
			link,
			item: items
		};
	}
};
//#endregion
export { route };
