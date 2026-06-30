declare module "amadeus" {
  interface AmadeusConfig {
    clientId: string;
    clientSecret: string;
    hostname?: "test" | "production";
  }

  export default class Amadeus {
    constructor(config: AmadeusConfig);
    client: {
      post(path: string, body?: unknown): Promise<{ data?: unknown; result?: unknown }>;
      get(path: string, params?: Record<string, string>): Promise<{ data?: unknown }>;
    };
    shopping: {
      flightOffersSearch: {
        get(params: Record<string, string>): Promise<{ data?: unknown[] }>;
      };
      flightOffers: {
        pricing: {
          post(body: unknown): Promise<{ data?: unknown }>;
        };
      };
    };
    booking: {
      flightOrders: {
        post(body: unknown): Promise<{ data?: unknown }>;
      };
    };
  }
}
