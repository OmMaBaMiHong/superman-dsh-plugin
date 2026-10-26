import { t as handler } from "./common-DI_ozvR8.mjs";
//#region lib/routes/nber/new.ts
const route = {
	name: "New Papers",
	maintainers: ["5upernova-heng"],
	path: "/new",
	example: "/nber/new",
	features: { supportScihub: true },
	radar: [{ source: ["nber.org/papers"] }],
	handler,
	url: "nber.org/papers",
	description: "Papers that are published in this week."
};
//#endregion
export { route };
