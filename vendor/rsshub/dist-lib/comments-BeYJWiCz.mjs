import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
//#region lib/routes/appstare/comments.ts
const handler = async (ctx) => {
	const country = ctx.req.param("country");
	const appid = ctx.req.param("appid");
	return {
		title: "App Comments",
		appID: appid,
		country,
		item: (await rofetch(`https://monitor.appstare.net/spider/appComments?country=${country}&appId=${appid}`)).map((item) => ({
			title: item.title,
			description: `
            <div style="font-size: 1.2em; color: #FFD700;">${"⭐️".repeat(Math.floor(item.rating))}</div>
            <p>${item.review}</p>
        `,
			pubDate: new Date(item.date).toUTCString()
		})),
		link: `https://appstare.net/data/app/comment/${appid}/${country}`,
		allowEmpty: true
	};
};
const route = {
	path: "/comments/:country/:appid",
	name: "Comments",
	url: "appstare.net/",
	example: "/appstare/comments/cn/989673964",
	maintainers: ["zhixideyu"],
	handler,
	parameters: {
		country: "App Store country code, e.g., US, CN",
		appid: "Unique App Store application identifier (app id)"
	},
	categories: ["program-update"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["appstare.net/"] }],
	description: "Retrieve only the comments of the app from the past 7 days."
};
//#endregion
export { handler, route };
