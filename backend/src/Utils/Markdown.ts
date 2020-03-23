import * as marked from "marked";

marked.setOptions({
  headerIds: false,
});

export function parseMarkdown(input: string): string {
  return marked(input);
}
