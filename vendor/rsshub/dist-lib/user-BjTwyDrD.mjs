import { t as utils_default } from "./utils-BohmnXcx.mjs";
//#region lib/routes/dribbble/user.ts
const route = {
	path: "/user/:name",
	categories: ["design"],
	example: "/dribbble/user/google",
	parameters: { name: "username, available in user's homepage URL" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["dribbble.com/:name"] }],
	name: "User (or team)",
	maintainers: ["DIYgod", "loganrockmore"],
	handler
};
async function handler(ctx) {
	const name = ctx.req.param("name");
	const url = `https://dribbble.com/${name}`;
	const title = `Dribbble - user ${name}`;
	return await utils_default.getData(url, title);
}
//#endregion
export { route };
