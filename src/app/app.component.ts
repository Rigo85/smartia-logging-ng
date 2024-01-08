import { Component, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet } from "@angular/router";
import { NavComponent } from "./components/nav/nav.component";
import { FooterComponent } from "./components/footer/footer.component";
import { LogsContainerComponent } from "./components/logs-container/logs-container.component";
import { LoggingService } from "(src)/app/services/logging.service";
import { map, Observable, startWith, Subscription } from "rxjs";
import { MessageLog } from "(src)/app/core/mesage-log";

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
export class AppComponent implements OnInit, OnDestroy {
	title = "smartia-logging-ng";
	private messagesSubscription!: Subscription;
	// public logs: MessageLog[] = [];
	public logs$!: Observable<MessageLog[]>;

	constructor(private webSocketService: LoggingService) {}

	ngOnInit(): void {
		this.logs$ = this.webSocketService.incomingMessage$.pipe(
			map((msg) => msg.data["logs"] || []),
			startWith([])
		);
		// this.messagesSubscription = this.webSocketService.incomingMessage$.subscribe({
		// 	next: (msg) => {
		// 		// console.info(msg);
		// 		this.logs = msg.data["logs"];
		// 		console.info(this.logs?.length);
		// 	},
		// 	error: (error) => {
		// 		console.error(error);
		// 	},
		// 	complete: () => {}
		// });
	}

	ngOnDestroy(): void {
		// if (this.messagesSubscription) {
		// 	this.messagesSubscription.unsubscribe();
		// }
	}
}
