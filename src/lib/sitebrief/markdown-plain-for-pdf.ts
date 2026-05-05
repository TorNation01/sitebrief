/** Strip common markdown constructs for naive PDF rendering (client-safe, no server-only imports). */
export function markdownToPlainForPdf(markdown: string): string {
  return markdown
    .replace(/\r/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^---$/gm, "")
    .replace(/^[-*]\s+/gm, "• ")
    .replace(/\\/g, "");
}
