import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet } from "@angular/router";
import { NavComponent } from "./components/nav/nav.component";
import { FooterComponent } from "./components/footer/footer.component";
import { LogsContainerComponent } from "./components/logs-container/logs-container.component";

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
export class AppComponent {
	title = "smartia-logging-ng";
}
