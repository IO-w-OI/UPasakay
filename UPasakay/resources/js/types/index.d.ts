// Allow TypeScript to resolve Vite/Laravel '@/' imports during type-checks
declare module "@/*";

// Provide a loose shape for route helpers if they are generated at build-time
declare module "@/routes" {
	const anything: any;
	export = anything;
}
