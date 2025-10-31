/**
 * Block domain model
 *
 * Represents a Notion block (content element).
 * This is an immutable domain model using Effect's Data class.
 */
import { Data } from "effect";

/**
 * Rich text element
 */
export type RichText = Readonly<{
  readonly type: "text";
  readonly text: Readonly<{
    readonly content: string;
    readonly link: Readonly<{ readonly url: string }> | null;
  }>;
  readonly annotations: Readonly<{
    readonly bold: boolean;
    readonly italic: boolean;
    readonly strikethrough: boolean;
    readonly underline: boolean;
    readonly code: boolean;
    readonly color: string;
  }>;
  readonly plain_text: string;
}>;

/**
 * Block content types
 */
export type BlockContent =
  | {
      readonly type: "paragraph";
      readonly paragraph: { readonly rich_text: readonly RichText[] };
    }
  | {
      readonly type: "heading_1";
      readonly heading_1: { readonly rich_text: readonly RichText[] };
    }
  | {
      readonly type: "heading_2";
      readonly heading_2: { readonly rich_text: readonly RichText[] };
    }
  | {
      readonly type: "heading_3";
      readonly heading_3: { readonly rich_text: readonly RichText[] };
    }
  | {
      readonly type: "bulleted_list_item";
      readonly bulleted_list_item: { readonly rich_text: readonly RichText[] };
    }
  | {
      readonly type: "numbered_list_item";
      readonly numbered_list_item: { readonly rich_text: readonly RichText[] };
    }
  | {
      readonly type: "to_do";
      readonly to_do: {
        readonly rich_text: readonly RichText[];
        readonly checked: boolean;
      };
    }
  | {
      readonly type: "code";
      readonly code: {
        readonly rich_text: readonly RichText[];
        readonly language: string;
      };
    }
  | {
      readonly type: "quote";
      readonly quote: { readonly rich_text: readonly RichText[] };
    }
  | { readonly type: "divider"; readonly divider: Record<string, never> };

/**
 * Block represents a Notion block (content element)
 *
 * @property id - Unique identifier (UUID with hyphens)
 * @property type - Block type
 * @property content - Block-specific content
 * @property createdTime - Creation timestamp
 * @property lastEditedTime - Last edit timestamp
 * @property hasChildren - Whether this block has child blocks
 * @property archived - Whether the block is archived
 */
export class Block extends Data.Class<{
  readonly id: string;
  readonly type: BlockContent["type"];
  readonly content: BlockContent;
  readonly createdTime: Date;
  readonly lastEditedTime: Date;
  readonly hasChildren: boolean;
  readonly archived: boolean;
}> {
  /**
   * Get the plain text content of the block
   *
   * @returns Plain text content
   */
  get plainText(): string {
    const richText = this.getRichText();
    return richText.map((rt) => rt.plain_text).join("");
  }

  /**
   * Get the rich text array from the block content
   *
   * @returns Rich text array
   */
  private getRichText(): readonly RichText[] {
    switch (this.content.type) {
      case "paragraph":
        return this.content.paragraph.rich_text;
      case "heading_1":
        return this.content.heading_1.rich_text;
      case "heading_2":
        return this.content.heading_2.rich_text;
      case "heading_3":
        return this.content.heading_3.rich_text;
      case "bulleted_list_item":
        return this.content.bulleted_list_item.rich_text;
      case "numbered_list_item":
        return this.content.numbered_list_item.rich_text;
      case "to_do":
        return this.content.to_do.rich_text;
      case "code":
        return this.content.code.rich_text;
      case "quote":
        return this.content.quote.rich_text;
      case "divider":
        return [];
    }
  }

  /**
   * Check if this is a heading block
   *
   * @returns True if heading
   */
  get isHeading(): boolean {
    return (
      this.type === "heading_1" ||
      this.type === "heading_2" ||
      this.type === "heading_3"
    );
  }

  /**
   * Check if this is a list item block
   *
   * @returns True if list item
   */
  get isListItem(): boolean {
    return (
      this.type === "bulleted_list_item" || this.type === "numbered_list_item"
    );
  }

  /**
   * Archive the block
   *
   * @returns New Block instance with archived status
   */
  archive(): Block {
    return new Block({
      ...this,
      archived: true,
      lastEditedTime: new Date(),
    });
  }
}

/**
 * Factory for creating new Block instances
 */
export const BlockFactory = {
  /**
   * Create a paragraph block
   *
   * @param text - Plain text content
   * @returns New Block instance
   */
  createParagraph(text: string): Block {
    const richText: RichText = {
      type: "text",
      text: {
        content: text,
        link: null,
      },
      annotations: {
        bold: false,
        italic: false,
        strikethrough: false,
        underline: false,
        code: false,
        color: "default",
      },
      plain_text: text,
    };

    const now = new Date();

    return new Block({
      id: "", // Will be set by API
      type: "paragraph",
      content: {
        type: "paragraph",
        paragraph: { rich_text: [richText] },
      },
      createdTime: now,
      lastEditedTime: now,
      hasChildren: false,
      archived: false,
    });
  },

  /**
   * Create a heading block
   *
   * @param text - Heading text
   * @param level - Heading level (1-3)
   * @returns New Block instance
   */
  createHeading(text: string, level: 1 | 2 | 3): Block {
    const richText: RichText = {
      type: "text",
      text: {
        content: text,
        link: null,
      },
      annotations: {
        bold: false,
        italic: false,
        strikethrough: false,
        underline: false,
        code: false,
        color: "default",
      },
      plain_text: text,
    };

    const now = new Date();
    const type = `heading_${level}`;

    const content: BlockContent =
      type === "heading_1"
        ? { type: "heading_1", heading_1: { rich_text: [richText] } }
        : type === "heading_2"
          ? { type: "heading_2", heading_2: { rich_text: [richText] } }
          : { type: "heading_3", heading_3: { rich_text: [richText] } };

    return new Block({
      id: "",
      type,
      content,
      createdTime: now,
      lastEditedTime: now,
      hasChildren: false,
      archived: false,
    });
  },
};
