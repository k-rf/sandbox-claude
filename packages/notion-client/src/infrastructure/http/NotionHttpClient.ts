/**
 * Notion HTTP client
 *
 * Provides HTTP client configured for Notion API with authentication.
 */
import { Context, Effect, Layer } from "effect";

import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import * as HttpClient from "@effect/platform/HttpClient";
import * as HttpClientRequest from "@effect/platform/HttpClientRequest";

import { NotionConfig } from "./NotionConfig";

/**
 * NotionHttpClient service
 *
 * Provides authenticated HTTP client for Notion API.
 */
export class NotionHttpClient extends Context.Tag("NotionHttpClient")<
  NotionHttpClient,
  {
    readonly get: (path: string) => Effect.Effect<unknown, Error>;
    readonly post: (
      path: string,
      options?: { readonly body?: unknown },
    ) => Effect.Effect<unknown, Error>;
    readonly patch: (
      path: string,
      options?: { readonly body?: unknown },
    ) => Effect.Effect<unknown, Error>;
    readonly delete: (path: string) => Effect.Effect<unknown, Error>;
  }
>() {}

/**
 * Live layer for NotionHttpClient
 *
 * Creates HTTP client with Notion API authentication.
 */
export const NotionHttpClientLive = Layer.effect(
  NotionHttpClient,
  Effect.gen(function* () {
    const config = yield* NotionConfig;
    const httpClient = yield* HttpClient.HttpClient;

    const makeRequest = (
      request: HttpClientRequest.HttpClientRequest,
    ): Effect.Effect<unknown, Error> =>
      Effect.gen(function* () {
        const authenticatedRequest = request.pipe(
          HttpClientRequest.setHeader(
            "Authorization",
            `Bearer ${config.apiToken}`,
          ),
          HttpClientRequest.setHeader("Notion-Version", config.apiVersion),
          HttpClientRequest.setHeader("Content-Type", "application/json"),
        );

        const response = yield* httpClient.execute(authenticatedRequest);
        return yield* response.json;
      }).pipe(Effect.scoped);

    return NotionHttpClient.of({
      get: (path) => {
        const url = `${config.baseUrl}${path}`;
        return makeRequest(HttpClientRequest.get(url));
      },

      post: (path, options) => {
        const request = HttpClientRequest.post(`${config.baseUrl}${path}`);

        if (options?.body !== undefined) {
          return makeRequest(
            HttpClientRequest.bodyUnsafeJson(request, options.body),
          );
        }

        return makeRequest(request);
      },

      patch: (path, options) => {
        const request = HttpClientRequest.patch(`${config.baseUrl}${path}`);

        if (options?.body !== undefined) {
          return makeRequest(
            HttpClientRequest.bodyUnsafeJson(request, options.body),
          );
        }

        return makeRequest(request);
      },

      delete: (path) =>
        makeRequest(HttpClientRequest.del(`${config.baseUrl}${path}`)),
    });
  }),
).pipe(Layer.provide(FetchHttpClient.layer));
