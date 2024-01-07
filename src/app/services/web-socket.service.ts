import { Inject, Injectable } from "@angular/core";
import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import { catchError, interval, Observable, retry, Subject, throwError } from "rxjs";
import * as dotenv from "dotenv";

dotenv.config({path: ".env"});
import { LogFilter } from "(src)/app/core/log-filter";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

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
export class WebSocketService {
	private webSocket!: WebSocketSubject<IncomingMessage>;

	private incomingMessages: Subject<IncomingMessage> = new Subject<IncomingMessage>();
	public incomingMessage$: Observable<IncomingMessage> = this.incomingMessages.asObservable();

	private _isRequestPending = false;
	private _isHostnameRequestPending = false;
	private _isStreaming = true;

	private logFilter: LogFilter = {};

	constructor() {
		this.webSocket = new WebSocketSubject<IncomingMessage>(process.env["WEB_SOCKET_URL"] || "");

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
				next: (msg: IncomingMessage) => this.incomingMessages.next(msg),
				error: err => console.error(err),
				complete: () => console.log("Closed connection")
			});

		let secInterval = 10;
		// try {
		// 	secInterval = parseInt("10");
		// } catch (error) {
		// 	console.error("Reading 'UPDATE_INTERVAL' ", error);
		// }

		interval(secInterval * 1000).subscribe(() => {
			console.info("-------------------> interval!");
			this.sendMessage({event: "update", data: this.logFilter});
		});
	}

	private sendMessage(msg: MessageFilter): void {
		this.webSocket.next(msg);
	}

	// closeWebSocket(): void {
	// 	this.webSocket.complete();
	// }
	//
	// onUpdateFilters(logFilter: LogFilter): void {
	// 	this.logFilter = logFilter;
	//
	// }

	// public set isRequestPending(isRequestPending: boolean) {
	// 	this._isRequestPending = isRequestPending;
	// }
	//
	// public set isHostnameRequestPending(isHostnameRequestPending: boolean) {
	// 	this._isHostnameRequestPending = isHostnameRequestPending;
	// }
	//
	// public set isStreaming(isStreaming: boolean) {
	// 	this._isStreaming = isStreaming;
	// }
}
