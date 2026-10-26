import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/bit/rszhaopin.ts
const route = {
	path: "/rszhaopin",
	categories: ["university"],
	example: "/bit/rszhaopin",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["rszhaopin.bit.edu.cn/"] }],
	name: "人才招聘",
	maintainers: ["nczitzk"],
	handler,
	url: "rszhaopin.bit.edu.cn/"
};
async function handler() {
	const rootUrl = "https://rszhaopin.bit.edu.cn";
	return {
		title: "人才招聘 - 北京理工大学",
		link: `${rootUrl}/zp.html#/notices/0`,
		item: (await got_default({
			method: "post",
			url: `${rootUrl}/ajax/ajaxService`,
			form: {
				__xml: "A2GgW6kPrLjaqavT0I8o9cOIXCYxazGialM66OpRk0MhwwOeUI1mF8yRBJHzicA9uL8Y9gYrXjdMocslRUopTMDJSRAykGXsjUoPibT4uK8Rz8Zj7U00coBCcJibpVwRZzFk",
				__type: "extTrans"
			}
		})).data.return_data.list.map((item) => ({
			title: item.title,
			description: item.content,
			pubDate: parseDate(item.createtime),
			link: `${rootUrl}/zp.html#/notice/${item.id}`
		}))
	};
}
//#endregion
export { route };
