import { Injectable } from "@angular/core";
import { WebSocketSubject } from "rxjs/webSocket";
import { catchError, interval, Observable, retry, Subject, throwError } from "rxjs";

import { LogFilter } from "(src)/app/core/log-filter";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { DateRecognition } from "(src)/app/core/date-recognition";

interface MessageFilter {
	event: "update" | "update-hostname";
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

	private incomingMessages: Subject<IncomingMessage> = new Subject<IncomingMessage>();
	public incomingMessage$: Observable<IncomingMessage> = this.incomingMessages.asObservable();

	private _isRequestPending = false;
	private _isHostnameRequestPending = false;
	private _isStreaming = true;

	public logFilter: LogFilter = {};

	constructor(private dateRecognition: DateRecognition) {
		this.webSocket = new WebSocketSubject<IncomingMessage>("ws://localhost:3005");

		// todo ver si es necesario almacenar la suscripción.
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
				// todo se podría guardar los ids de los logs y usarlos luego para enviar al backend para filtrar.
				next: (msg: IncomingMessage) => this.incomingMessages.next(msg),
				error: err => console.error(err),
				complete: () => console.log("Closed connection")
			});

		this.sendMessage({event: "update", data: this.logFilter});
		let secInterval = 10;
		interval(secInterval * 1000).subscribe(() => {
			if (this.isStreaming) {
				this.sendMessage({event: "update", data: this.logFilter});
			}
		});

		// todo agregar peticiones para los hostnames.
	}

	private sendMessage(msg: MessageFilter): void {
		this.webSocket.next(msg);
	}

	closeWebSocket(): void {
		this.webSocket.complete();
	}

	public set isRequestPending(isRequestPending: boolean) {
		this._isRequestPending = isRequestPending;
	}

	public set isHostnameRequestPending(isHostnameRequestPending: boolean) {
		this._isHostnameRequestPending = isHostnameRequestPending;
	}

	public set isStreaming(isStreaming: boolean) {
		this._isStreaming = isStreaming;
	}

	public get isStreaming(): boolean {
		return this._isStreaming;
	}

	public onFilterLogs(): void {
		console.log(`-----------------> changing filter! '${JSON.stringify(this.logFilter)}'`);
	}

	public onInputFilter(query: string): void {
		this.logFilter.inputFilter = query;

		this.onFilterLogs();
	}

	public onDateQueryFilter(query: string): void {
		this.logFilter.queryString = query;
		this.logFilter.dateFilter = this.dateRecognition.dateRecognition(query);

		this.onFilterLogs();
	}
}
