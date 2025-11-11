/**
 * Notion API configuration
 *
 * Manages Notion API credentials and settings.
 */
import { Context, Effect, Layer } from "effect";

import * as Config from "effect/Config";

/**
 * NotionConfig service
 *
 * Provides access to Notion API configuration.
 */
export class NotionConfig extends Context.Tag("NotionConfig")<
  NotionConfig,
  {
    readonly apiToken: string;
    readonly apiVersion: string;
    readonly baseUrl: string;
  }
>() {}

/**
 * Live layer for NotionConfig
 *
 * Loads configuration from environment variables.
 */
export const NotionConfigLive = Layer.effect(
  NotionConfig,
  Effect.gen(function* () {
    const apiToken = yield* Config.string("NOTION_API_TOKEN");
    const apiVersion = yield* Effect.orElse(
      Config.string("NOTION_API_VERSION"),
      () => Effect.succeed("2022-06-28"),
    );
    const baseUrl = yield* Effect.orElse(
      Config.string("NOTION_API_BASE_URL"),
      () => Effect.succeed("https://api.notion.com/v1"),
    );

    return NotionConfig.of({
      apiToken,
      apiVersion,
      baseUrl,
    });
  }),
);
