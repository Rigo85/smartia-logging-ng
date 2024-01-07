import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faPause, faPlay } from "@fortawesome/free-solid-svg-icons";
import { NgbPopoverModule } from "@ng-bootstrap/ng-bootstrap";
import { Subscription } from "rxjs";

import { LogFilter } from "(src)/app/core/log-filter";
import { DateRecognition } from "(src)/app/core/date-recognition";
import { DateFilterPopoverComponent } from "(src)/app/components/date-filter-popover/date-filter-popover.component";
import { WebSocketService } from "(src)/app/services/web-socket.service";

@Component({
	selector: "app-footer",
	standalone: true,
	imports: [
		FontAwesomeModule,
		FormsModule,
		NgbPopoverModule,
		DateFilterPopoverComponent
	],
	templateUrl: "./footer.component.html",
	styleUrl: "./footer.component.scss",
	providers: []
})
export class FooterComponent implements OnInit, OnDestroy {
	faPause = faPause;
	faPlay = faPlay;
	isStreaming = true;
	logFilter: LogFilter = {};
	private messagesSubscription!: Subscription;

	constructor(private dateRecognition: DateRecognition, private webSocketService: WebSocketService) {}

	onStartStop() {
		console.log(`------------------------------> ${Boolean(!this.isStreaming).toString()}`);
		this.isStreaming = !this.isStreaming;
	}

	onDateFilter(query: string): void {
		this.logFilter.queryString = query;

		this.onFilterLogs();
	}

	onKeydown() {
		this.onFilterLogs();
	}

	private onFilterLogs(): void {
		console.log(`-----------------> changing filter! '${this.logFilter.inputFilter}' '${this.logFilter.hostnameFilter}' '${this.logFilter.queryString}'`);
	}

	ngOnInit(): void {
		this.logFilter.hostnameFilter = "All Hostnames";

		this.messagesSubscription = this.webSocketService.incomingMessage$.subscribe({
			next: (msg) => {
				console.info(msg);
			},
			error: (error) => {
				console.error(error);
			},
			complete: () => {}
		});
	}

	ngOnDestroy(): void {
		if (this.messagesSubscription) {
			this.messagesSubscription.unsubscribe();
		}
	}
}
