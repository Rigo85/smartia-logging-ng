import Recognizers from "@microsoft/recognizers-text-suite";
import { DateFilter } from "(src)/app/core/date-filter";
import { Injectable } from "@angular/core";

interface DateTimeRange {
	timex: string;
	type: string;
	start: string;
	end: string;
}

interface DateTime {
	timex: string;
	type: string;
	value: string;
}

type DateTimeResolver = (resolutionValues: DateTime[], typeName: string) => DateFilter;
type DateTimeRangeResolver = (resolutionValues: DateTimeRange[], typeName: string) => DateFilter;

@Injectable({
	providedIn: "root"
})
export class DateRecognition {
	constructor() {

	}

	public dateRecognition(query: string): DateFilter | undefined {
		const results = Recognizers.recognizeDateTime(query, Recognizers.Culture.English);
		// console.info(JSON.stringify(results));

		const mapper: Record<string, DateTimeResolver | DateTimeRangeResolver> = {
			"datetimeV2.date": this.resolveDateTime,
			"datetimeV2.datetime": this.resolveDateTime,
			"datetimeV2.daterange": this.resolveDateTimeRange,
			"datetimeV2.datetimerange": this.resolveDateTimeRange,
			"datetimeV2.time": this.resolveTime,
			"datetimeV2.timerange": this.resolveTimeRange
		};

		if (!results.length || !results[0].resolution || !results[0].resolution["values"])
			return undefined;

		const resolver = mapper[results[0].typeName];

		if (!resolver)
			return undefined;

		return resolver(results[0].resolution["values"], results[0].typeName);
	}

	private resolveDateTime(resolutionValues: DateTime[], typeName: string): DateFilter {
		return {
			dates: resolutionValues.map((m: DateTime) => new Date(m.value)),
			typeName
		};
	}

	private resolveDateTimeRange(resolutionValues: DateTimeRange[], typeName: string): DateFilter {
		return {
			dates: resolutionValues
				.map((m: DateTimeRange) =>
					[
						new Date(m.start),
						new Date(m.end)
					].filter((d: Date) => !isNaN(d.getTime()))
				)
				.flat()
				.filter((d: Date) => d),
			typeName
		};
	}

	private resolveTime(resolutionValues: DateTime[], typeName: string): DateFilter {
		return {
			dates: resolutionValues.map((m: DateTime) => {
				const date = new Date();
				return new Date(
					date.getFullYear() + "-" +
					String(date.getMonth() + 1).padStart(2, "0") + "-" +
					String(date.getDate()).padStart(2, "0") + "T" +
					m.value);
			}),
			typeName
		};
	}

	private resolveTimeRange(resolutionValues: DateTimeRange[], typeName: string): DateFilter {
		const date = new Date();
		return {
			dates: resolutionValues
				.map((m: DateTimeRange) =>
					[
						new Date(
							date.getFullYear() + "-" +
							String(date.getMonth() + 1).padStart(2, "0") + "-" +
							String(date.getDate()).padStart(2, "0") + "T" +
							m.start),
						new Date(
							date.getFullYear() + "-" +
							String(date.getMonth() + 1).padStart(2, "0") + "-" +
							String(date.getDate()).padStart(2, "0") + "T" +
							m.end)
					]
				)
				.flat(),
			typeName
		};
	}
}
