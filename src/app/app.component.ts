import { AfterViewChecked, AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { AsyncPipe, CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import { BehaviorSubject, filter, map, tap } from "rxjs";

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
		NavComponent,
		FooterComponent,
		LogsContainerComponent,
		AsyncPipe
	],
	templateUrl: "./app.component.html",
	styleUrl: "./app.component.scss"
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {
	private readonly checkScrollInterval: any;
	@ViewChild(LogsContainerComponent) logsContainer!: LogsContainerComponent;

	private logsSubject = new BehaviorSubject<MessageLog[]>([]);
	public logs$ = this.logsSubject.asObservable();
	private allLogs: MessageLog[] = [];
	private oldHeight: number = 0;
	loading = false;
	oldersLoading = false;
	isBottom = true;
	public hostnames: string[] = ["All Hostnames"];
	public paramHostname: string = "";
	public paramQuery: string = "";
	public paramDateQuery: string = "";
	private needScrollAdjustment: number = 0;

	constructor(private loggingService: LoggingService, private route: ActivatedRoute, private router: Router) {
		this.loggingService.onFilterLogs();

		this.checkScrollInterval = setInterval(() => {
			// console.log(`isStreaming: ${this.loggingService.isStreaming} isAtBottom: ${this.isAtBottom()} loading: ${this.loading}`);
			if (this.loggingService.isStreaming && this.isAtBottom() && !this.loading) {
				this.loading = true;
				this.loggingService.onFilterLogs();
			}
		}, 5000);
	}

	private isAtBottom(): boolean {
		if (this.logsContainer) {
			const element = this.logsContainer.container.nativeElement;
			// console.info(`scrollTop=${element.scrollTop} clientHeight=${element.clientHeight} scrollHeight=${element.scrollHeight} sum=${element.scrollTop + element.clientHeight + 1}`)
			return element.scrollTop + element.clientHeight + 1 >= element.scrollHeight;
		}
		return false;
	}

	ngAfterViewChecked() {
		if (this.needScrollAdjustment < 2) {
			this.needScrollAdjustment += 1;
			const element = this.logsContainer.container.nativeElement;
			element.scrollTop = element.scrollHeight;
		}
	}

	adjustScroll(needAdjustment: boolean = false): void {
		// console.log(`-----------------------------> needAdjustment: ${needAdjustment}, bottom: ${this.isAtBottom()}`);
		if (this.isAtBottom() || needAdjustment) {
			setTimeout(() => {
				const element = this.logsContainer.container.nativeElement;
				element.scrollTop = element.scrollHeight;
			});
		}
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

		this.loggingService.incomingOlderMessages$
			.pipe(
				map(msg => msg.data["logs"] || []),
				tap(() => {
					this.oldersLoading = false;
				})
			)
			.subscribe((olderLogs: MessageLog[]) => {
				this.allLogs = [...olderLogs, ...this.allLogs];
				this.logsSubject.next(this.allLogs);

				setTimeout(() => {
					const element = this.logsContainer.container.nativeElement;
					const newHeight = element.scrollHeight;
					element.scrollTop = newHeight - this.oldHeight;
				});
			});

		this.loggingService.incomingMessage$
			.pipe(
				tap(() => {
					this.loading = false;
				}),
				filter(() => this.loggingService.isStreaming),
				map(msg => msg.data["logs"] || [])
			)
			.subscribe((newLogs: MessageLog[]) => {
				this.allLogs = [...this.allLogs, ...newLogs];
				this.logsSubject.next(this.allLogs);

				const hostnames = new Set(this.allLogs.map((log: MessageLog) => log.hostname));
				this.hostnames = ["All Hostnames", ...Array.from(hostnames)];

				this.adjustScroll();
			});
	}

	loadOlderLogs(): void {
		if (!this.oldersLoading) {
			const element = this.logsContainer.container.nativeElement;
			this.oldHeight = element.scrollHeight;
			this.oldersLoading = true;
			// this.loading = false;

			const oldestLog = this.allLogs[0];
			this.loggingService.onGetOlderLogs(oldestLog.id);
		}
	}

	onScroll(_: any): void {
		// console.log(`----------------------> isAtBottom: ${this.isAtBottom()}`);
		this.loggingService.isStreaming = this.isAtBottom();
		this.isBottom = this.isAtBottom();

		if (this.logsContainer.container.nativeElement.scrollTop === 0 && !this.oldersLoading) {
			console.log("Cargar logs anteriores...");
			this.loadOlderLogs();
		}
	}

	ngAfterViewInit(): void {
		if (this.logsContainer) {
			this.logsContainer.container.nativeElement.addEventListener("scroll", (event: any) => {
				this.onScroll(event);
			});
		}
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
