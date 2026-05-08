export function escapePhpSingleQuotedString(value: string): string {
	return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}
