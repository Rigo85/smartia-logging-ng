import {
	Component,
	EventEmitter,
	Output, ViewChild,
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
	@ViewChild("p1") popOver!: NgbPopover;

	toggleDateFilter(popover: NgbPopover) {
		if (popover.isOpen()) {
			popover.close();
		} else {
			popover.open();
		}
	}

	onNewQuerySearch(query: string): void {
		if ((query?.trim() ?? "") !== this.oldQuery) {
			this.oldQuery = query?.trim() ?? "";
			this.newQueryEvent.emit(this.oldQuery);
		}
	}

	onKeyDown(): void {
		this.onNewQuerySearch(this.query);
		if (this.popOver) {
			this.popOver.close();
		}
	}

	onClick(): void {
		this.onKeyDown();
	}

	onShown(): void {
		this.query = this.query?.trim();
	}
}
