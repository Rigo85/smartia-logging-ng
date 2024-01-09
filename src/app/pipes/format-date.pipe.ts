import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
	name: "formatDate",
	standalone: true
})
export class FormatDatePipe implements PipeTransform {

	transform(value: string): string {
		const date = new Date(value);
		const optionsDate = {month: "short", day: "numeric"} as Intl.DateTimeFormatOptions;
		const optionsTime = {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: false
		} as Intl.DateTimeFormatOptions;
		const formattedDate = new Intl.DateTimeFormat("en-US", optionsDate).format(date);
		let formattedTime = new Intl.DateTimeFormat("en-US", optionsTime).format(date);
		if (formattedTime.startsWith("24")) {
			formattedTime = "00" + formattedTime.slice(2);
		}
		return `${formattedDate} ${formattedTime}`;
	}

}
