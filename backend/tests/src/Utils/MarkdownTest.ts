import {expect} from "chai";
import {parseMarkdown} from "backend/src/Markdown";

describe("parseMarkdown", () => {
  it("parses markdown and returns HTML", () => {
    expect(parseMarkdown("# H1")).to.equal("<h1>H1</h1>\n", "supports <H1/>");
    expect(parseMarkdown("A simple paragraph.")).to.equal("<p>A simple paragraph.</p>\n", "supports paragraphs");
    expect(
      parseMarkdown(
        `\n\nThis is the first paragraph.\n\n\n\n\n` +
          `This is the second paragraph. The heading and trailing new-line characters should be trimmed.\n\n\n\n`
      )
    ).to.equal(
      `<p>This is the first paragraph.</p>\n` +
        `<p>This is the second paragraph. The heading and trailing new-line characters should be trimmed.</p>\n`,
      "supports multiple paragraphs"
    );
    expect(parseMarkdown("**bold**")).to.equal("<p><strong>bold</strong></p>\n", "supports bold formatting");

    expect(parseMarkdown(`A sample bulletted list\n\n- item one\n- item two\n- item three\n`)).to.equal(
      `<p>A sample bulletted list</p>\n` +
        `<ul>\n` +
        `<li>item one</li>\n` +
        `<li>item two</li>\n` +
        `<li>item three</li>\n` +
        `</ul>\n`
    );

    expect(parseMarkdown(`A sample numbered list\n\n1. item one\n2. item two\n3. item three\n`)).to.equal(
      `<p>A sample numbered list</p>\n` +
        `<ol>\n` +
        `<li>item one</li>\n` +
        `<li>item two</li>\n` +
        `<li>item three</li>\n` +
        `</ol>\n`
    );

    expect(parseMarkdown("[localhost](http://localhost:8085/inregistrare)")).to.equal(
      `<p><a href="http://localhost:8085/inregistrare">localhost</a></p>\n`,
      "supports links"
    );

    expect(parseMarkdown("http://localhost:8085/inregistrare")).to.equal(
      `<p><a href="http://localhost:8085/inregistrare">http://localhost:8085/inregistrare</a></p>\n`,
      "automatically detect links"
    );
  });
});
