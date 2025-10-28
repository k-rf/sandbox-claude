/**
 * Page domain model
 *
 * Represents a Notion page.
 * This is an immutable domain model using Effect's Data class.
 */
import { Data } from "effect";

/**
 * Property value types in Notion
 */
export type PropertyValue =
  | {
      readonly type: "title";
      readonly title: readonly {
        readonly text: { readonly content: string };
      }[];
    }
  | {
      readonly type: "rich_text";
      readonly rich_text: readonly {
        readonly text: { readonly content: string };
      }[];
    }
  | { readonly type: "number"; readonly number: number | null }
  | {
      readonly type: "select";
      readonly select: { readonly name: string } | null;
    }
  | {
      readonly type: "multi_select";
      readonly multi_select: readonly { readonly name: string }[];
    }
  | {
      readonly type: "date";
      readonly date: {
        readonly start: string;
        readonly end: string | null;
      } | null;
    }
  | { readonly type: "checkbox"; readonly checkbox: boolean }
  | { readonly type: "url"; readonly url: string | null }
  | { readonly type: "email"; readonly email: string | null }
  | { readonly type: "phone_number"; readonly phone_number: string | null };

/**
 * Page properties (name -> value mapping)
 */
export type PageProperties = Readonly<Record<string, PropertyValue>>;

/**
 * Page represents a Notion page
 *
 * @property id - Unique identifier (UUID with hyphens)
 * @property properties - Page properties (title, custom properties)
 * @property createdTime - Creation timestamp
 * @property lastEditedTime - Last edit timestamp
 * @property archived - Whether the page is archived
 * @property url - Notion URL to the page
 */
export class Page extends Data.Class<{
  readonly id: string;
  readonly properties: PageProperties;
  readonly createdTime: Date;
  readonly lastEditedTime: Date;
  readonly archived: boolean;
  readonly url: string;
}> {
  /**
   * Get the title of the page
   *
   * @returns Page title as string, or empty string if no title
   */
  get title(): string {
    for (const [_name, value] of Object.entries(this.properties)) {
      if (value.type === "title" && value.title.length > 0) {
        return value.title.map((t) => t.text.content).join("");
      }
    }
    return "";
  }

  /**
   * Get a property value by name
   *
   * @param name - Property name
   * @returns Property value or undefined if not found
   */
  getProperty(name: string): PropertyValue | undefined {
    return this.properties[name];
  }

  /**
   * Check if the page has a specific property
   *
   * @param name - Property name
   * @returns True if the property exists
   */
  hasProperty(name: string): boolean {
    return name in this.properties;
  }

  /**
   * Archive the page
   *
   * @returns New Page instance with archived status
   */
  archive(): Page {
    return new Page({
      ...this,
      archived: true,
      lastEditedTime: new Date(),
    });
  }

  /**
   * Unarchive the page
   *
   * @returns New Page instance with active status
   */
  unarchive(): Page {
    return new Page({
      ...this,
      archived: false,
      lastEditedTime: new Date(),
    });
  }
}

/**
 * Factory for creating new Page instances
 */
export const PageFactory = {
  /**
   * Create a new page with minimal properties
   *
   * @param params - Page parameters
   * @param params.title - Page title
   * @param params.properties - Additional properties
   * @returns New Page instance
   */
  create(params: {
    readonly title: string;
    readonly properties?: PageProperties;
  }): Page {
    const titleProperty: PropertyValue = {
      type: "title",
      title: [{ text: { content: params.title } }],
    };

    const now = new Date();

    return new Page({
      id: "", // Will be set by API
      properties: {
        Title: titleProperty,
        ...params.properties,
      },
      createdTime: now,
      lastEditedTime: now,
      archived: false,
      url: "", // Will be set by API
    });
  },
};
