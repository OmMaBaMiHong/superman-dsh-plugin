import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import duration from "dayjs/plugin/duration.js";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";
import weekday from "dayjs/plugin/weekday.js";
//#region lib/utils/parse-date.ts
dayjs.extend(customParseFormat);
dayjs.extend(duration);
dayjs.extend(isSameOrBefore);
dayjs.extend(weekday);
const REGEX_JUST_NOW = /^(?:just\s?now|刚刚|剛剛)$/i;
const REGEX_AGO = /(.*)(?:ago|前)$/i;
const REGEX_IN = /^in\s*(.*)|(.*)(?:later|after|[后後])$/i;
const REGEX_STICKY_AMPM = /(\d+)\s*(a|p)m$/i;
const REGEX_IS_PM = /下午|晚上|晚|pm|p\.m\./i;
const REGEX_IS_AM = /上午|凌晨|早|晨|am|a\.m\./i;
const UNIT_PATTERNS = [
	{
		unit: "years",
		regExp: /(\d+)\s*(?:年|y(?:ea)?rs?)/i
	},
	{
		unit: "months",
		regExp: /(\d+)\s*(?:[个個]?月|months?)/i
	},
	{
		unit: "weeks",
		regExp: /(\d+)\s*(?:周|[个個]?星期|weeks?)/i
	},
	{
		unit: "days",
		regExp: /(\d+)\s*(?:天|日|d(?:ay)?s?)/i
	},
	{
		unit: "hours",
		regExp: /(\d+)\s*(?:[个個]?(?:小?时|[時点點])|h(?:(?:ou)?r)?s?)/i
	},
	{
		unit: "minutes",
		regExp: /(\d+)\s*(?:分[鐘钟]?|m(?:in(?:ute)?)?s?)/i
	},
	{
		unit: "seconds",
		regExp: /(\d+)\s*(?:秒[鐘钟]?|s(?:ec(?:ond)?)?s?)/i
	}
];
const CN_NUM_MAP = {
	一: "1",
	二: "2",
	两: "2",
	三: "3",
	四: "4",
	五: "5",
	六: "6",
	七: "7",
	八: "8",
	九: "9",
	十: "10"
};
/**
* Calculates the date of the most recent occurrence of a specific weekday.
*
* If the target weekday is the same as today or occurs later in the current week,
* it returns the date from the previous week.
*
* @param targetDay - The day index: 1 (Monday) to 7 (Sunday).
* @returns A Dayjs object representing the start of that day.
*/
const getLastWeekday = (targetDay) => {
	const today = dayjs();
	const currentDayIndex = today.day();
	let daysToAdd = (targetDay === 7 ? 0 : targetDay) - currentDayIndex;
	if (daysToAdd >= 0) daysToAdd -= 7;
	return today.add(daysToAdd, "day").startOf("day");
};
const KEYWORDS = [
	{
		regExp: /^(?:今[天日早晨晚]|to?day?)/i,
		calc: () => dayjs().startOf("day")
	},
	{
		regExp: /^(?:昨[天日早晨晚]|y(?:ester)?day?)/i,
		calc: () => dayjs().subtract(1, "days").startOf("day")
	},
	{
		regExp: /^(?:前天|(?:the)?d(?:ay)?b(?:eforeyesterda)?y)/i,
		calc: () => dayjs().subtract(2, "days").startOf("day")
	},
	{
		regExp: /^(?:明[天日早晨晚]|t(?:omorrow)?)/i,
		calc: () => dayjs().add(1, "days").startOf("day")
	},
	{
		regExp: /^(?:[后後][天日]|(?:the)?d(?:ay)?a(?:fter)?t(?:omrrow)?)/i,
		calc: () => dayjs().add(2, "days").startOf("day")
	},
	{
		regExp: /^(?:mon(?:day)?|(?:周|星期)[1一])/i,
		calc: () => getLastWeekday(1)
	},
	{
		regExp: /^(?:tue(?:sday)?|(?:周|星期)[2二两])/i,
		calc: () => getLastWeekday(2)
	},
	{
		regExp: /^(?:wed(?:nesday)?|(?:周|星期)[3三])/i,
		calc: () => getLastWeekday(3)
	},
	{
		regExp: /^(?:thu(?:rsday)?|(?:周|星期)[4四])/i,
		calc: () => getLastWeekday(4)
	},
	{
		regExp: /^(?:fri(?:day)?|(?:周|星期)[5五])/i,
		calc: () => getLastWeekday(5)
	},
	{
		regExp: /^(?:sat(?:urday)?|(?:周|星期)[6六])/i,
		calc: () => getLastWeekday(6)
	},
	{
		regExp: /^(?:sun(?:day)?|(?:周|星期)[7日天])/i,
		calc: () => getLastWeekday(7)
	}
];
/**
* Normalizes the input string to a format suitable for parsing.
*
* Operations performed:
* - Lowercasing and trimming.
* - Converting English articles/quantifiers ('a', 'an', 'x') to numbers.
* - Converting Chinese numerals and quantifiers to Arabic numbers.
* - Removing punctuation (commas).
*
* @param date - The raw date string to normalize.
* @returns The normalized string.
*/
const normalize = (date) => {
	let str = date.toLowerCase().trim();
	if (REGEX_JUST_NOW.test(str)) return "just now";
	str = str.replaceAll(/(^|\s)an?(\s)/g, "$11$2");
	str = str.replaceAll(/(^|\s)x(\s|$)/g, "$13$2");
	str = str.replaceAll(/[几幾数]/g, "3");
	str = str.replaceAll(/[一二两三四五六七八九十]/g, (match) => CN_NUM_MAP[match] || match);
	str = str.replaceAll(",", "");
	return str;
};
/**
* Parses a string to extract the total duration based on predefined unit patterns.
*
* @param str - The string containing time units (e.g., "1 hour 30 mins").
* @returns A Dayjs Duration object representing the total time.
*/
const parseDuration = (str) => {
	let totalDuration = dayjs.duration(0);
	const cleanStr = str.replaceAll(/\s+/g, "");
	for (const { unit, regExp } of UNIT_PATTERNS) {
		const match = regExp.exec(cleanStr);
		if (match) {
			const val = Number(match[1]);
			if (!Number.isNaN(val)) totalDuration = totalDuration.add(val, unit);
		}
	}
	return totalDuration;
};
/**
* A wrapper around `dayjs()` to parse standard date formats.
*
* @param date - The date input (string, number, or Date object).
* @param options - Optional Day.js configuration (e.g., format string).
* @returns A native JavaScript Date object.
*/
const parseDate = (date, ...options) => dayjs(date, ...options).toDate();
/**
* Processes a date string composed of a semantic keyword and an optional time component.
*
* @param baseTime - The calculated base date (start of day).
* @param timePart - The string segment containing the time info (e.g., "3pm", "10:00").
* @param originalContext - The original normalized string for context detection (AM/PM modifiers).
* @returns The resolved Date object.
*/
const processSemanticKeyword = (baseTime, timePart, originalContext) => {
	if (!timePart) return baseTime.toDate();
	const isPM = REGEX_IS_PM.test(originalContext);
	const isAM = REGEX_IS_AM.test(originalContext);
	const fixTimePart = timePart.replace(REGEX_STICKY_AMPM, "$1 $2m");
	let addedMillis = parseDuration(fixTimePart).asMilliseconds();
	const stickyMatch = REGEX_STICKY_AMPM.exec(timePart);
	if (addedMillis === 0 && stickyMatch) addedMillis = Number(stickyMatch[1]) * 60 * 60 * 1e3;
	if (addedMillis > 0) {
		const hours = dayjs.duration(addedMillis).asHours();
		if (isPM && hours < 12) addedMillis += 720 * 60 * 1e3;
		else if (isAM && hours === 12) addedMillis -= 720 * 60 * 1e3;
		return baseTime.add(addedMillis, "ms").toDate();
	}
	const tried = dayjs(`${baseTime.format("YYYY-MM-DD")} ${fixTimePart}`, [
		"YYYY-MM-DD HH:mm:ss",
		"YYYY-MM-DD HH:mm",
		"YYYY-MM-DD H:m",
		"YYYY-MM-DD h:m a",
		"YYYY-MM-DD h a"
	]);
	if (tried.isValid()) {
		let result = tried;
		if (isPM && result.hour() < 12) result = result.add(12, "hours");
		return result.toDate();
	}
	return baseTime.toDate();
};
/**
* Parses a relative or semantic date string into a JavaScript Date object.
*
* This function handles a variety of natural language date formats, including:
*
* 1. **Immediate Time**:
*    - `Just now`, `刚刚`
*
* 2. **Relative Durations**:
*    - Past: `10 minutes ago`, `an hour ago`, `x days ago`, `几分钟前`
*    - Future: `in 10 minutes`, `2 hours later`, `10分钟后`
*
* 3. **Semantic Keywords**:
*    - `Today`, `Yesterday`, `Tomorrow`, `TDA`, `今天`, `昨天`, `明天`
*    - `Monday`, `Tuesday`... (Always resolves to the previous occurrence if ambiguous)
*    - `周一`, `星期三`, `前天`
*
* 4. **Combined Semantic Expressions** (Date + Time + Context):
*    - Explicit Time: `Yesterday 10:00`, `Monday 3pm`
*    - Contextual Modifiers: `Today 3pm`, `昨晚8点` (Yesterday Evening), `明早8点` (Tomorrow Morning)
*    - Mixed Formats: `周五下午3点`, `Today 3 p.m.`
*
* 5. **Fallback**:
*    - Any format not matched above is passed to Day.js with the provided options.
*
* @param date - The relative or absolute date string to parse.
* @param options - Optional configuration passed to Day.js for fallback parsing.
* @returns A parsed JavaScript Date object.
*/
const parseRelativeDate = (date, ...options) => {
	if (!date) return /* @__PURE__ */ new Date();
	const normalized = normalize(date);
	if (normalized === "just now") return dayjs().subtract(3, "seconds").toDate();
	const agoMatch = REGEX_AGO.exec(normalized);
	if (agoMatch) {
		const duration = parseDuration(agoMatch[1]);
		if (duration.asMilliseconds() > 0) return dayjs().subtract(duration).toDate();
	}
	const inMatch = REGEX_IN.exec(normalized);
	if (inMatch) {
		const duration = parseDuration(inMatch[1] || inMatch[2]);
		if (duration.asMilliseconds() > 0) return dayjs().add(duration).toDate();
	}
	const cleanStr = normalized.replaceAll(/\s+/g, "");
	for (const word of KEYWORDS) if (word.regExp.exec(cleanStr)) {
		const baseTime = word.calc();
		const timePart = cleanStr.replace(word.regExp, "");
		return processSemanticKeyword(baseTime, timePart, normalized);
	}
	return parseDate(date, ...options);
};
//#endregion
export { parseRelativeDate as n, parseDate as t };
