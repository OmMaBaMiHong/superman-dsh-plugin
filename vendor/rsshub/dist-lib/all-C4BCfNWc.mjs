import { t as handler } from "./common-DI_ozvR8.mjs";
//#region lib/routes/nber/all.ts
const route = {
	name: "All Papers",
	maintainers: ["5upernova-heng"],
	path: "/papers",
	example: "/nber/papers",
	features: { supportScihub: true },
	radar: [{ source: ["nber.org/papers"] }],
	handler,
	url: "nber.org/papers"
};
//#endregion
export { route };
