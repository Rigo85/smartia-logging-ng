import {
	Component, ElementRef,
	Input, ViewChild
} from "@angular/core";

import { FormatDatePipe } from "(src)/app/pipes/format-date.pipe";
import { MessageLog } from "(src)/app/core/mesage-log";

@Component({
	selector: "app-logs-container",
	standalone: true,
	imports: [FormatDatePipe],
	templateUrl: "./logs-container.component.html",
	styleUrl: "./logs-container.component.scss"
})
export class LogsContainerComponent {
	@Input() logs!: MessageLog[];
	@ViewChild("container") container!: ElementRef;

	getHostnameUrl(hostname: string): string {
		return `/?hostname=${encodeURIComponent(hostname)}`;
	}

	getQueryUrl(query: string) {
		return `/?query=${encodeURIComponent(query)}`;
	}
}
