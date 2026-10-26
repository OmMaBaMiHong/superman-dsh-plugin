//#region lib/utils/readable-social.ts
const fallback = (a, b, c) => {
	if (a !== void 0 && a !== null) return a;
	if (b !== void 0 && b !== null) return b;
	return c;
};
const queryToBoolean = (s) => {
	if (s === void 0 || s === null) return s;
	if (Array.isArray(s)) {
		if (s.length === 0) return;
		s = s[0];
	}
	s = s.toString();
	return !(s.toLowerCase() === "false" || s === "0");
};
const queryToInteger = (s) => {
	if (s === void 0 || s === null) return s;
	if (Array.isArray(s)) {
		if (s.length === 0) return;
		s = s[0];
	}
	s = s.toString();
	return Number.parseInt(s);
};
const queryToFloat = (s) => {
	if (s === void 0 || s === null) return s;
	if (Array.isArray(s)) {
		if (s.length === 0) return;
		s = s[0];
	}
	s = s.toString();
	return Number(s);
};
//#endregion
export { queryToInteger as i, queryToBoolean as n, queryToFloat as r, fallback as t };
