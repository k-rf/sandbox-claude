/**
 * Toggl API configuration
 *
 * Manages Toggl API credentials and settings.
 */
import { Context, Effect, Layer } from "effect";

import * as Config from "effect/Config";

/**
 * TogglConfig service
 *
 * Provides access to Toggl API configuration.
 */
export class TogglConfig extends Context.Tag("TogglConfig")<
  TogglConfig,
  {
    readonly apiToken: string;
    readonly baseUrl: string;
  }
>() {}

/**
 * Live layer for TogglConfig
 *
 * Loads configuration from environment variables.
 */
export const TogglConfigLive = Layer.effect(
  TogglConfig,
  Effect.gen(function* () {
    const apiToken = yield* Config.string("TOGGL_API_TOKEN");
    const baseUrl = yield* Effect.orElse(
      Config.string("TOGGL_API_BASE_URL"),
      () => Effect.succeed("https://api.track.toggl.com/api/v9"),
    );

    return TogglConfig.of({
      apiToken,
      baseUrl,
    });
  }),
);
