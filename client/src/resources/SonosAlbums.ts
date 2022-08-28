import { Resource } from "@rest-hooks/rest";
import config from "../config";

export class AlbumsResource extends Resource {
  readonly item_id: string;
  readonly title: string;
  readonly album_art_uri: string;

  static list<T extends typeof Resource>(this: T) {
    return super.list().extend({
      schema: { results: [this], total: 0, limit: 0, skip: 0 },
    });
  }

  pk() {
    return this.item_id;
  }
  static urlRoot = `${config.baseUrl}/albums`;
}
