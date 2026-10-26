import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { load } from "cheerio";
//#region lib/routes/cybersecurityventures/news.ts
const categories = {
	today: {
		label: "Today's News",
		scene: 12,
		view: 14
	},
	"intrusion-daily-cyber-threat-alert": {
		label: "Cyberattacks",
		scene: 13,
		view: 15
	},
	"ransomware-minute": {
		label: "Ransomware",
		scene: 16,
		view: 18
	},
	cryptocrime: {
		label: "Cryptocrime",
		scene: 18,
		view: 20
	},
	"hack-blotter": {
		label: "Hack Blotter",
		scene: 19,
		view: 21
	},
	"cybersecurity-venture-capital-vc-deals": {
		label: "VC Deal Flow",
		scene: 3,
		view: 3
	},
	"mergers-and-acquisitions-report": {
		label: "M&A Tracker",
		scene: 11,
		view: 13
	}
};
const route = {
	name: "News",
	categories: ["programming"],
	path: "/news/:category?",
	example: "/cybersecurityventures/news",
	radar: Object.entries(categories).map(([key, value]) => ({
		source: [`cybersecurityventures.com/${key}`],
		target: `/news/${key}`,
		title: value.label
	})),
	parameters: { category: {
		description: "news category",
		default: "today",
		options: Object.entries(categories).map(([key, value]) => ({
			value: key,
			label: value.label
		}))
	} },
	handler,
	maintainers: ["KarasuShin"],
	features: { supportRadar: true },
	view: 0
};
async function handler(ctx) {
	const rootUrl = "https://cybersecurityventures.com/";
	const apiUrl = "https://us-east-1-renderer-read.knack.com/v1";
	const category = ctx.req.param("category") ?? "today";
	const limit = ctx.req.query("limit") ?? 20;
	if (!Object.hasOwn(categories, category)) throw new InvalidParameterError("Invalid category");
	const { scene, view, label } = categories[category];
	const data = await rofetch(`${apiUrl}/scenes/scene_${scene}/views/view_${view}/records?format=raw&page=1&rows_per_page=${limit}&sort_field=field_2&sort_order=desc`, { headers: {
		"X-Knack-Application-Id": "6013171b60be8f001cb27363",
		"X-Knack-Rest-Api-Key": "renderer"
	} });
	return {
		title: `${label} - Cybercrime Magazine`,
		link: `${rootUrl}/${category}`,
		item: data.records.map((item) => {
			const $ = load(item.field_3, null, false);
			const link = $("a").attr("href");
			const description = `<p>${item.field_4}</p><br>${$.html()}`;
			return {
				title: item.field_5,
				description,
				pubDate: parseDate(item.field_2.iso_timestamp),
				link,
				guid: `cybersecurityventures:${item.id}`
			};
		})
	};
}
//#endregion
export { route };
