import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faPause, faPlay, IconDefinition, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { NgbPopoverModule } from "@ng-bootstrap/ng-bootstrap";

import { LoggingService } from "(src)/app/services/logging.service";
import { DateFilterPopoverComponent } from "(src)/app/components/date-filter-popover/date-filter-popover.component";
import { AsyncPipe } from "@angular/common";

@Component({
	selector: "app-footer",
	standalone: true,
	imports: [
		FontAwesomeModule,
		FormsModule,
		NgbPopoverModule,
		DateFilterPopoverComponent,
		AsyncPipe
	],
	templateUrl: "./footer.component.html",
	styleUrl: "./footer.component.scss",
	providers: []
})
export class FooterComponent implements OnInit {
	@Input() inputFilter = "";
	private oldInputFilter = "";
	private oldDateQueryFilter = "";
	@Input() isAtBottom!: boolean;
	@Output() newAdjustScrollEvent = new EventEmitter<boolean>;
	@Output() newHostnameEvent = new EventEmitter<string>;
	@Output() newQueryEvent = new EventEmitter<string>;
	@Output() newDateQueryEvent = new EventEmitter<string>;
	@Input() hostnameFilter: string = "All Hostnames";
	@Input() hostnames!: string[];

	constructor(public loggingService: LoggingService) { }

	ngOnInit(): void {
		this.hostnameFilter = "All Hostnames";
	}

	onInputFilter() {
		if ((this.inputFilter?.trim() ?? "") !== this.oldInputFilter) {
			this.oldInputFilter = this.inputFilter?.trim() ?? "";
			this.loggingService.onInputFilter(this.oldInputFilter);
		}

		this.newQueryEvent.emit(this.inputFilter);
	}

	onDateFilter(query: string) {
		if ((query?.trim() ?? "") !== this.oldDateQueryFilter) {
			this.oldDateQueryFilter = query?.trim() ?? "";
			this.loggingService.onDateQueryFilter(this.oldDateQueryFilter);
		}

		this.newDateQueryEvent.emit(query);
	}

	onStartStopEvent() {
		if (!this.isAtBottom) {
			this.loggingService.isStreaming = true;
			this.newAdjustScrollEvent.emit(true);
		}

		this.loggingService.isStreaming = !this.loggingService.isStreaming;
	}

	getIcon(): IconDefinition {
		if (!this.isAtBottom) return faChevronDown;

		return this.loggingService.isStreaming ? faPause : faPlay;
	}

	onHostnameChangeEvent(hostname: string) {
		this.newHostnameEvent.emit(hostname);
		this.loggingService.onHostnameFilter(hostname?.trim() || "");
	}
}
