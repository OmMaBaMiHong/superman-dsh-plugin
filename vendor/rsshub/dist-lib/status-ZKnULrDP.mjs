import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
//#region lib/routes/furaffinity/status.ts
const route = {
	path: "/status",
	name: "Status",
	url: "furaffinity.net",
	categories: ["social-media"],
	example: "/furaffinity/status",
	maintainers: ["TigerCubDen", "SkyNetX007"],
	parameters: {},
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
		source: ["furaffinity.net"],
		target: "/"
	}],
	handler
};
async function handler() {
	const data = await rofetch("https://faexport.spangle.org.uk/status.json", {
		method: "GET",
		headers: { Referer: "https://faexport.spangle.org.uk/" }
	});
	const description = Object.keys(data)[0] === "online" ? `Status: FA Server Online <br> Guests: ${data.online.guests} <br> Registered: ${data.online.registered} <br> Other: ${data.online.other} <br> Total: ${data.online.total} <br> FA Server Time: ${data.fa_server_time} <br> FA Server Time at: ${data.fa_server_time_at}` : "FA Server Offline";
	return {
		title: "Fur Affinity | Status",
		link: "https://www.furaffinity.net/",
		description: "Fur Affinity Status",
		item: [{
			title: `Status: ${Object.keys(data)[0]}`,
			link: "https://www.furaffinity.net/",
			description
		}]
	};
}
//#endregion
export { route };
