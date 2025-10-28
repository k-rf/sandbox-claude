/**
 * Database domain model
 *
 * Represents a Notion database.
 * This is an immutable domain model using Effect's Data class.
 */
import { Data } from "effect";

import type { RichText } from "./Block";

/**
 * Database property configuration
 */
export type DatabasePropertyConfig =
  | { readonly type: "title"; readonly title: Record<string, never> }
  | { readonly type: "rich_text"; readonly rich_text: Record<string, never> }
  | { readonly type: "number"; readonly number: { readonly format: string } }
  | {
      readonly type: "select";
      readonly select: {
        readonly options: readonly {
          readonly name: string;
          readonly color: string;
        }[];
      };
    }
  | {
      readonly type: "multi_select";
      readonly multi_select: {
        readonly options: readonly {
          readonly name: string;
          readonly color: string;
        }[];
      };
    }
  | { readonly type: "date"; readonly date: Record<string, never> }
  | { readonly type: "checkbox"; readonly checkbox: Record<string, never> }
  | { readonly type: "url"; readonly url: Record<string, never> }
  | { readonly type: "email"; readonly email: Record<string, never> }
  | {
      readonly type: "phone_number";
      readonly phone_number: Record<string, never>;
    };

/**
 * Database properties schema
 */
export type DatabaseProperties = Readonly<
  Record<string, DatabasePropertyConfig>
>;

/**
 * Database represents a Notion database
 *
 * @property id - Unique identifier (UUID with hyphens)
 * @property title - Database title
 * @property description - Database description
 * @property properties - Database property schema
 * @property createdTime - Creation timestamp
 * @property lastEditedTime - Last edit timestamp
 * @property archived - Whether the database is archived
 * @property url - Notion URL to the database
 */
export class Database extends Data.Class<{
  readonly id: string;
  readonly title: readonly RichText[];
  readonly description: readonly RichText[];
  readonly properties: DatabaseProperties;
  readonly createdTime: Date;
  readonly lastEditedTime: Date;
  readonly archived: boolean;
  readonly url: string;
}> {
  /**
   * Get the plain text title of the database
   *
   * @returns Database title as string
   */
  get plainTitle(): string {
    return this.title.map((rt) => rt.plain_text).join("");
  }

  /**
   * Get the plain text description of the database
   *
   * @returns Database description as string
   */
  get plainDescription(): string {
    return this.description.map((rt) => rt.plain_text).join("");
  }

  /**
   * Get property names
   *
   * @returns Array of property names
   */
  get propertyNames(): readonly string[] {
    return Object.keys(this.properties);
  }

  /**
   * Get a property configuration by name
   *
   * @param name - Property name
   * @returns Property configuration or undefined
   */
  getProperty(name: string): DatabasePropertyConfig | undefined {
    return this.properties[name];
  }

  /**
   * Check if the database has a specific property
   *
   * @param name - Property name
   * @returns True if the property exists
   */
  hasProperty(name: string): boolean {
    return name in this.properties;
  }

  /**
   * Archive the database
   *
   * @returns New Database instance with archived status
   */
  archive(): Database {
    return new Database({
      ...this,
      archived: true,
      lastEditedTime: new Date(),
    });
  }

  /**
   * Unarchive the database
   *
   * @returns New Database instance with active status
   */
  unarchive(): Database {
    return new Database({
      ...this,
      archived: false,
      lastEditedTime: new Date(),
    });
  }
}
