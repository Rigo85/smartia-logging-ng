import { Injectable } from "@angular/core";
import { WebSocketSubject } from "rxjs/webSocket";
import { catchError, Observable, retry, Subject, throwError } from "rxjs";

import { LogFilter } from "(src)/app/core/log-filter";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

interface MessageFilter {
	event: "update" | "update-hostname" | "update-olders";
	data: LogFilter;
}

interface IncomingMessage {
	event: string;
	data: any;
}

@Injectable({
	providedIn: "root"
})
export class LoggingService {
	private webSocket!: WebSocketSubject<IncomingMessage>;

	private incomingOlderMessages: Subject<IncomingMessage> = new Subject<IncomingMessage>();
	private incomingMessages: Subject<IncomingMessage> = new Subject<IncomingMessage>();
	private incomingHostnames: Subject<IncomingMessage> = new Subject<IncomingMessage>();

	public incomingOlderMessages$: Observable<IncomingMessage> = this.incomingOlderMessages.asObservable();
	public incomingMessage$: Observable<IncomingMessage> = this.incomingMessages.asObservable();
	public incomingHostnames$: Observable<IncomingMessage> = this.incomingHostnames.asObservable();

	private _isStreaming = true;

	public logFilter: LogFilter = {};

	constructor() {
		// this.webSocket = new WebSocketSubject<IncomingMessage>("wss://smartia-logging-ui-backend.services.smartia-ai.com");
		this.webSocket = new WebSocketSubject<IncomingMessage>("ws://localhost:3005");

		this.webSocket
			.pipe(
				catchError(err => {
					console.error("WebSocket error occurred:", err);
					return throwError(err);
				}),
				retry({delay: 3_000}),
				takeUntilDestroyed()
			)
			.subscribe({
				next: (msg: IncomingMessage) => {
					if (msg.event === "update") {
						// console.log("------------------> incoming message!");
						this.incomingMessages.next(msg);
					} else if (msg.event === "update-olders") {
						this.incomingOlderMessages.next(msg);
					}

					// if (msg.event === "hostnames") {
					// 	// this.incomingHostnames.next(msg);
					// } else {
					// 	this.incomingMessages.next(msg);
					// }
				},
				error: err => console.error(err),
				complete: () => console.log("Closed connection")
			});
	}

	private sendMessage(msg: MessageFilter): void {
		this.webSocket.next(msg);
	}

	public set isStreaming(isStreaming: boolean) {
		// console.log("-------------> " + `${isStreaming}`);
		this._isStreaming = isStreaming;
	}

	public get isStreaming(): boolean {
		return this._isStreaming;
	}

	public onFilterLogs(force: boolean = false): void {
		// console.log(`-----------------> onFilterLogs: '${JSON.stringify(this.logFilter)}'`);
		if (this.isStreaming || force) {
			this.sendMessage({event: "update", data: this.logFilter});
		}
	}

	public onGetOlderLogs(id: number) {
		this.sendMessage({event: "update-olders", data: {id}});
	}

	public onInputFilter(query: string): void {
		this.logFilter.inputFilter = query;

		this.onFilterLogs(true);
	}

	public onDateQueryFilter(query: string): void {
		this.logFilter.queryString = query;
		this.logFilter.dateFilter = undefined;
		this.logFilter.offset = -new Date().getTimezoneOffset();

		this.onFilterLogs(true);
	}

	onHostnameFilter(hostname: string) {
		this.logFilter.hostnameFilter = hostname;

		this.onFilterLogs(true);
	}
}
