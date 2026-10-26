import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/tmtpost/nictation.ts
const route = {
	path: "/nictation",
	categories: ["new-media"],
	example: "/tmtpost/word",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: { source: ["www.tmtpost.com"] },
	name: "快报",
	maintainers: ["defp"],
	handler,
	url: "www.tmtpost.com/nictation"
};
async function handler() {
	const currentTime = Math.floor(Date.now() / 1e3);
	return {
		title: "钛媒体 - 快报",
		link: "https://www.tmtpost.com/nictation",
		item: (await got_default({
			method: "get",
			url: "https://api.tmtpost.com/v1/word/list",
			searchParams: {
				time_start: currentTime - 3600,
				time_end: currentTime,
				limit: 40,
				fields: [
					"share_description",
					"share_image",
					"word_comments",
					"stock_list",
					"is_important",
					"duration",
					"word_classify",
					"share_link"
				].join(";")
			},
			headers: { "app-version": "web1.0" }
		})).data.data.map((item) => ({
			title: item.title,
			description: item.detail,
			pubDate: parseDate(item.time_published, "X"),
			link: item.share_link || `https://www.tmtpost.com/nictation/${item.guid}.html`,
			author: item.author_name
		}))
	};
}
//#endregion
export { route };
