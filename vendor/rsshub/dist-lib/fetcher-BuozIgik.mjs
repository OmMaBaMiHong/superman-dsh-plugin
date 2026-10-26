import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
//#region lib/routes/yystv/fetcher.ts
function fetchDataItemCached(link, processor) {
	return cache_default.tryGet(link, async () => {
		return processor(await rofetch(link));
	});
}
//#endregion
export { fetchDataItemCached as t };
