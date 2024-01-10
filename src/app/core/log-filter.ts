import { DateFilter } from "./date-filter";

export interface LogFilter {
	hostnameFilter?: string;
	inputFilter?: string;
	queryString?: string;
	dateFilter?: DateFilter;
	direction?: "UP" | "DOWN";
	startId?: number;
	endId?: number;
}
