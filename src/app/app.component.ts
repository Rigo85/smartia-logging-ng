import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { AsyncPipe, CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { map, Observable, startWith, tap } from "rxjs";

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
		LogsContainerComponent,
		AsyncPipe
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
	public hostnames: string[] = ["All Hostnames"];
	public paramHostname: string = "";
	public paramQuery: string = "";
	public paramDateQuery: string = "";

	constructor(private loggingService: LoggingService, private route: ActivatedRoute, private router: Router) {
		this.loggingService.onFilterLogs();

		this.checkScrollInterval = setInterval(() => {
			if (this.isAtBottom() && !this.loading) {
				this.loading = true;
				this.loggingService.onFilterLogs();
			}
		}, 5000);
	}

	private isAtBottom(): boolean {
		if (this.container) {
			const element = this.container.nativeElement;
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
		this.route.queryParams.subscribe(params => {
			this.paramHostname = params["hostname"]?.trim() || "";
			this.paramQuery = params["query"]?.trim() || "";
			this.paramDateQuery = params["when"]?.trim() || "";

			this.loggingService.logFilter.hostnameFilter = this.paramHostname;
			this.loggingService.logFilter.inputFilter = this.paramQuery;
			this.loggingService.logFilter.queryString = this.paramDateQuery;
		});

		this.logs$ = this.loggingService.incomingMessage$.pipe(
			map((msg) => msg.data["logs"] || []),
			tap((logs) => {
				this.loading = false;
				this.adjustScroll();
			}),
			startWith([])
		);

		this.logs$.subscribe((logs: MessageLog[]) => {
			const _hostnames = new Set(logs.map((log: MessageLog) => log.hostname));
			this.hostnames = ["All Hostnames", ...Array.from(_hostnames)];
		});
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

	onNewHostnameEvent(hostname: string) {
		this.changeURL(hostname, undefined, undefined);
	}

	private changeURL(hostname: string | undefined, query: string | undefined, dateQuery: string | undefined) {
		const queryParams: Record<string, string> = {};

		const _hostname = hostname?.trim() ?? this.paramHostname;
		const _query = query?.trim() ?? this.paramQuery;
		const _when = dateQuery?.trim() ?? this.paramDateQuery;
		if (_hostname) {
			queryParams["hostname"] = _hostname;
		}
		if (_query) {
			queryParams["query"] = _query;
		}
		if (_when) {
			queryParams["when"] = _when;
		}

		this.router.navigate(["/"], {queryParams});
	}

	onNewQueryEvent(query: string) {
		this.changeURL(undefined, query, undefined);
	}

	onNewDateQueryEvent(dateQuery: string) {
		this.changeURL(undefined, undefined, dateQuery);
	}
}
