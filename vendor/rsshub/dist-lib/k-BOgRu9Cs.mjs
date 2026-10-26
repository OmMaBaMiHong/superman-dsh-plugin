import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/caixin/k.ts
const route = {
	path: "/k",
	categories: ["traditional-media"],
	example: "/caixin/k",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: true,
		supportScihub: false
	},
	name: "财新一线",
	maintainers: ["boypt"],
	handler
};
async function handler() {
	return {
		title: "财新网 - 财新一线新闻",
		link: "https://k.caixin.com/web/",
		description: "财新网 - 财新一线新闻",
		item: (await got_default("https://k.caixin.com/app/v1/list", { searchParams: {
			productIdList: "8,28",
			uid: "",
			unit: 1,
			name: "",
			code: "",
			deviceType: "",
			device: "",
			userTag: "",
			p: 1,
			c: 20
		} })).data.data.list.map((item) => {
			const hasAudio = item.audio_url || Object.values(item.audios)[0];
			return {
				title: item.title,
				description: item.text,
				link: `http://k.caixin.com/web/detail_${item.oneline_news_code}`,
				pubDate: parseDate(item.ts, "x"),
				author: "财新一线",
				enclosure_url: hasAudio ? item.audio_url || Object.values(item.audios)[0] : void 0,
				enclosure_type: hasAudio ? "audio/mpeg" : void 0
			};
		})
	};
}
//#endregion
export { route };
