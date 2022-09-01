import { Resource, EndpointExtraOptions } from "@rest-hooks/rest";
import config from "../config";

export class QueueResource extends Resource {
  item_id: string;
  creator: string;
  title: string;
  album: string;
  album_art_uri: string;
  original_track_number: number;

  static getEndpointExtra(): EndpointExtraOptions {
    return {
      pollFrequency: 5000,
    };
  }

  static list<T extends typeof Resource>(this: T) {
    return super.list().extend({
      schema: { results: [this], total: 0 },
    });
  }

  pk() {
    return this.item_id;
  }
  static urlRoot = `${config.baseUrl}/queue`;
}
