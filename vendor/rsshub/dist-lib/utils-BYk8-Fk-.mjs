import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
//#region lib/routes/discourse/utils.ts
function getConfig(ctx) {
	const discourseConfig = config.discourse.config[ctx.req.param("configId")];
	if (!discourseConfig) throw new ConfigNotFoundError("Discourse RSS is disabled due to the lack of <a href=\"https://docs.rsshub.app/deploy/\">relevant config</a>");
	return discourseConfig;
}
//#endregion
export { getConfig as t };
