/**
 * Toggl HTTP client
 *
 * Provides HTTP client configured for Toggl API with authentication.
 */
import { Context, Effect, Layer } from "effect";

import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import * as HttpClient from "@effect/platform/HttpClient";
import * as HttpClientRequest from "@effect/platform/HttpClientRequest";

import { TogglConfig } from "./TogglConfig";

/**
 * TogglHttpClient service
 *
 * Provides authenticated HTTP client for Toggl API.
 */
export class TogglHttpClient extends Context.Tag("TogglHttpClient")<
  TogglHttpClient,
  {
    readonly get: (
      path: string,
      options?: { readonly params?: Record<string, string | number> },
    ) => Effect.Effect<unknown, Error>;
    readonly post: (
      path: string,
      options?: { readonly body?: unknown },
    ) => Effect.Effect<unknown, Error>;
    readonly put: (
      path: string,
      options?: { readonly body?: unknown },
    ) => Effect.Effect<unknown, Error>;
    readonly delete: (path: string) => Effect.Effect<unknown, Error>;
  }
>() {}

/**
 * Live layer for TogglHttpClient
 *
 * Creates HTTP client with Toggl API authentication.
 */
export const TogglHttpClientLive = Layer.effect(
  TogglHttpClient,
  Effect.gen(function* () {
    const config = yield* TogglConfig;
    const httpClient = yield* HttpClient.HttpClient;

    const authHeader = `Basic ${Buffer.from(`${config.apiToken}:api_token`).toString("base64")}`;

    const makeRequest = (
      request: HttpClientRequest.HttpClientRequest,
    ): Effect.Effect<unknown, Error> =>
      Effect.gen(function* () {
        const authenticatedRequest = request.pipe(
          HttpClientRequest.setHeader("Authorization", authHeader),
          HttpClientRequest.setHeader("Content-Type", "application/json"),
        );

        const response = yield* httpClient.execute(authenticatedRequest);
        return yield* response.json;
      });

    return TogglHttpClient.of({
      get: (path, options) => {
        const url = `${config.baseUrl}${path}`;

        if (options?.params !== undefined) {
          const params = new URLSearchParams(
            Object.entries(options.params).map(([k, v]) => [k, String(v)]),
          );
          return makeRequest(
            HttpClientRequest.get(`${url}?${params.toString()}`),
          );
        }

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

      put: (path, options) => {
        const request = HttpClientRequest.put(`${config.baseUrl}${path}`);

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
