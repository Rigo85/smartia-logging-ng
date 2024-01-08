import { Component, Input } from "@angular/core";
import { MessageLog } from "(src)/app/core/mesage-log";

@Component({
	selector: "app-logs-container",
	standalone: true,
	imports: [],
	templateUrl: "./logs-container.component.html",
	styleUrl: "./logs-container.component.scss"
})
export class LogsContainerComponent {
	@Input() logs: MessageLog[] = [];

	public formatDate(dateTime: string): string {
		const date = new Date(dateTime);
		const optionsDate = {month: "short", day: "numeric"} as Intl.DateTimeFormatOptions;
		const optionsTime = {hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false} as Intl.DateTimeFormatOptions;
		const formattedDate = new Intl.DateTimeFormat("en-US", optionsDate).format(date);
		let formattedTime = new Intl.DateTimeFormat("en-US", optionsTime).format(date);
		if (formattedTime.startsWith("24")) {
			formattedTime = "00" + formattedTime.slice(2);
		}
		return `${formattedDate} ${formattedTime}`;
	}
}
