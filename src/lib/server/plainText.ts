/**
 * Companion replies are shown in speech bubbles and a plain chat log, which don't render
 * Markdown. Strip the common inline/block markers so visitors never see raw `**` or `#`.
 */
export function stripMarkdown(input: string): string {
  return input
    .replace(/```[a-z]*\n?([\s\S]*?)```/gi, '$1') // fenced code -> contents
    .replace(/`([^`]+)`/g, '$1') // inline code
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1') // images -> alt text
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '$1 ($2)') // links -> "text (url)"
    .replace(/(\*\*|__)(.+?)\1/g, '$2') // bold
    .replace(/(^|[^\w*])\*(?!\s)([^*\n]+?)\*(?!\w)/g, '$1$2') // italic *x*
    .replace(/(^|[^\w_])_(?!\s)([^_\n]+?)_(?!\w)/g, '$1$2') // italic _x_
    .replace(/~~(.+?)~~/g, '$1') // strikethrough
    .replace(/^\s{0,3}#{1,6}\s+/gm, '') // headings
    .replace(/^\s{0,3}>\s?/gm, '') // blockquotes
    .replace(/^\s*[-*+]\s+/gm, '• ') // bullet lists
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
