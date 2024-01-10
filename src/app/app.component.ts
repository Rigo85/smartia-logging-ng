import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet } from "@angular/router";
import { map, Observable, startWith, tap, of, BehaviorSubject } from "rxjs";

import { NavComponent } from "(src)/app/components/nav/nav.component";
import { FooterComponent } from "(src)/app/components/footer/footer.component";
import { LogsContainerComponent } from "(src)/app/components/logs-container/logs-container.component";
import { MessageLog } from "(src)/app/core/mesage-log";
import { LoggingService } from "(src)/app/services/logging.service";

@Component({
	selector: "app-root",
	standalone: true,
	imports: [
		CommonModule,
		RouterOutlet,
		NavComponent,
		FooterComponent,
		LogsContainerComponent
	],
	templateUrl: "./app.component.html",
	styleUrl: "./app.component.scss"
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
	title = "smartia-logging-ng";
	private readonly checkScrollInterval: any;
	@ViewChild("container") container!: ElementRef;
	public logs$!: Observable<MessageLog[]>;
	loading = false;
	isBottom = true;

	constructor(private loggingService: LoggingService) {
		this.loggingService.onFilterLogs();

		this.checkScrollInterval = setInterval(() => {
			// console.info(`isAtBottom: ${this.isAtBottom()} loading: ${this.loading}`);
			if (this.isAtBottom() && !this.loading) {
				this.loading = true;
				this.loggingService.onFilterLogs();
			}
		}, 5000);
	}

	private isAtBottom(): boolean {
		if (this.container) {
			const element = this.container.nativeElement;
			// console.info(`element.scrollTop:${element.scrollTop} + element.clientHeight:${element.clientHeight} >= element.scrollHeight:${element.scrollHeight}, ${element.scrollTop + element.clientHeight + 1}`);
			return element.scrollTop + element.clientHeight + 1 >= element.scrollHeight;
		}
		return false;
	}

	adjustScroll(needAdjustment: boolean = true): void {
		setTimeout(() => {
			const element = this.container.nativeElement;
			const newHeight = element.scrollHeight;
			element.scrollTop = newHeight - element.clientHeight;
		});
	}

	ngOnDestroy(): void {
		if (this.checkScrollInterval) {
			clearInterval(this.checkScrollInterval);
		}
	}

	ngOnInit(): void {
		this.logs$ = this.loggingService.incomingMessage$.pipe(
			map((msg) => msg.data["logs"] || []),
			tap((logs) => {
				this.loading = false;
				this.adjustScroll();
			}),
			startWith([])
		);
	}

	onScroll(event: any): void {
		this.loggingService.isStreaming = this.isAtBottom();
		this.isBottom = this.isAtBottom();
	}

	ngAfterViewInit(): void {
		this.container.nativeElement.addEventListener("scroll", (event: any) => {
			this.onScroll(event);
		});
	}
}
