import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faPause, faPlay, IconDefinition, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { NgbPopoverModule } from "@ng-bootstrap/ng-bootstrap";
import { Observable } from "rxjs";

import { LoggingService } from "(src)/app/services/logging.service";

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
	providers: []
})
export class FooterComponent implements OnInit {
	faPause = faPause;
	faPlay = faPlay;
	faChevronDown = faChevronDown;
	inputFilter = "";
	private oldInputFilter = "";
	private oldDateQueryFilter = "";
	@Input() isAtBottom!: boolean;
	@Output() newAdjustScrollEvent = new EventEmitter<boolean>;
	@Input() hostnames!: string[];

	constructor(public loggingService: LoggingService) { }

	ngOnInit(): void {
		this.loggingService.logFilter.hostnameFilter = "All Hostnames";
	}

	onInputFilter() {
		if ((this.inputFilter?.trim() ?? "") !== this.oldInputFilter) {
			this.oldInputFilter = this.inputFilter?.trim() ?? "";
			this.loggingService.onInputFilter(this.oldInputFilter);
		}
	}

	onDateFilter(query: string) {
		if ((query?.trim() ?? "") !== this.oldDateQueryFilter) {
			this.oldDateQueryFilter = query?.trim() ?? "";
			this.loggingService.onDateQueryFilter(this.oldDateQueryFilter);
		}
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
}
