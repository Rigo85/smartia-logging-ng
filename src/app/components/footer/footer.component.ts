import { Component, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faPause, faPlay } from "@fortawesome/free-solid-svg-icons";
import { NgbPopoverModule } from "@ng-bootstrap/ng-bootstrap";

import { LogFilter } from "(src)/app/core/log-filter";
import { DateRecognition } from "(src)/app/core/date-recognition";
import { DateFilterPopoverComponent } from "(src)/app/components/date-filter-popover/date-filter-popover.component";

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
	providers: [DateRecognition]
})
export class FooterComponent implements OnInit {
	faPause = faPause;
	faPlay = faPlay;

	isStreaming = true;

	logFilter: LogFilter = {
		hostnameFilter: "",
		inputFilter: "",
		queryString: "",
		dateFilter: {
			dates: [],
			typeName: ""
		}
	};

	private dateRecognition = inject(DateRecognition);

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
	}

}
