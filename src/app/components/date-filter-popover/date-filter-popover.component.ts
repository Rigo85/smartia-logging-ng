import {
	Component,
	EventEmitter,
	Output,
	ViewEncapsulation
} from "@angular/core";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { faClock as farClock } from "@fortawesome/free-regular-svg-icons";
import { NgbPopover, NgbPopoverModule } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule } from "@angular/forms";

@Component({
	selector: "app-date-filter-popover",
	standalone: true,
	imports: [
		FontAwesomeModule,
		NgbPopoverModule,
		FormsModule
	],
	templateUrl: "./date-filter-popover.component.html",
	styleUrl: "./date-filter-popover.component.scss",
	encapsulation: ViewEncapsulation.None
})
export class DateFilterPopoverComponent {
	@Output() newQueryEvent = new EventEmitter<string>;
	faClock = faClock;
	farClock = farClock;
	query: string = "";
	oldQuery: string = "";

	toggleDateFilter(popover: NgbPopover) {
		if (popover.isOpen()) {
			popover.close();
		} else {
			popover.open();
		}
	}

	onNewQuerySearch(query: string): void {
		const _query = query?.trim();
		if (_query && _query !== this.oldQuery) {
			this.newQueryEvent.emit(_query);
		}
	}

	onShown(): void {
		this.oldQuery = this.query?.trim();
		this.query = this.query?.trim();
	}
}
