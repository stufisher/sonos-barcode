import { Resource } from "@rest-hooks/rest";

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
  static urlRoot = "http://127.0.0.1:8001/albums";
}
