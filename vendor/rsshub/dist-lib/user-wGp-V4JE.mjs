import "./types-DNj6Etbg.mjs";
//#region lib/routes/picnob.info/user.ts
const route = {
	path: "/user/:id/:type?",
	categories: ["social-media"],
	example: "/picnob.info/user/xlisa_olivex",
	parameters: {
		id: "Instagram id",
		type: {
			description: "Type of profile page",
			default: "posts",
			options: [{
				label: "Posts",
				value: "posts"
			}]
		}
	},
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "User Profile - Picnob.info",
	maintainers: ["TonyRL"],
	handler,
	view: 2,
	url: "picnob.info"
};
function handler(ctx) {
	const id = ctx.req.param("id");
	return ctx.set("redirect", `/picnob/user/${id}`);
}
//#endregion
export { route };
