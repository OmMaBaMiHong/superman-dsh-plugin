import { strict } from "node:assert";
//#region lib/utils/timezone.ts
const millisInAnHour = 3600 * 1e3;
const serverTimezone = -(/* @__PURE__ */ new Date()).getTimezoneOffset() / 60;
function timezone(date, timezone = serverTimezone) {
	if (typeof date === "string") date = new Date(date);
	strict.ok(date instanceof Date);
	return /* @__PURE__ */ new Date(date.getTime() - millisInAnHour * (timezone - serverTimezone));
}
//#endregion
export { timezone as t };
