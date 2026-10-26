import { t as config } from "./config-B5Cf_tHS.mjs";
import Parser from "rss-parser";
//#region lib/utils/rss-parser.ts
const parser = new Parser({
	customFields: { item: ["magnet"] },
	headers: { "User-Agent": config.ua }
});
//#endregion
export { parser as t };
