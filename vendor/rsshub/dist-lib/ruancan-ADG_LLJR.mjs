import { t as fetchFeed } from "./utils-INacok5b.mjs";
//#region lib/routes/ruancan/index.ts
const route = {
	path: "/",
	radar: [{
		source: ["ruancan.com/"],
		target: ""
	}],
	name: "Unknown",
	maintainers: [],
	handler,
	url: "ruancan.com/"
};
async function handler(ctx) {
	return await fetchFeed(ctx, "");
}
//#endregion
export { route };
