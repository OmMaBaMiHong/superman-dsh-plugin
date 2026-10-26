import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
//#region lib/routes/natgeo/dailyselection.ts
const route = {
	path: "/dailyselection",
	name: "Daily Selection",
	categories: ["picture"],
	view: 2,
	example: "/natgeo/dailyselection",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false
	},
	radar: [{ source: ["nationalgeographic.com/"] }],
	maintainers: ["OrangeEd1t"],
	handler
};
async function handler() {
	const data = await got_default("http://dili.bdatu.com/jiekou/mains/p1.html");
	let sort = 0;
	let addtime = "";
	for (const album of data.data.album) {
		if (Number.parseInt(album.ds) !== 1) continue;
		sort = album.sort;
		addtime = album.addtime;
		break;
	}
	const api = "http://dili.bdatu.com/jiekou/albums/a" + sort + ".html";
	const items = (await got_default(api)).data.picture;
	const out = [];
	items.map((item) => {
		const info = {
			title: item.title,
			link: item.url,
			description: `<img src="${item.url}"><br>` + item.content,
			pubDate: timezone(parseDate(addtime), 0),
			guid: item.id
		};
		out.push(info);
		return info;
	});
	return {
		title: "Photo of the Daily Selection",
		link: api,
		item: out
	};
}
//#endregion
export { route };
