import { Resource, EndpointExtraOptions } from "@rest-hooks/rest";

export class StatusResource extends Resource {
  player_name: string;
  coordinator_name: string;
  title: string;
  artist: string;
  album: string;
  album_art_uri: string;
  position: string;
  duration: string;
  transport_state: string;

  static getEndpointExtra(): EndpointExtraOptions {
    return {
      pollFrequency: 1000,
    };
  }


  pk() {
    return this.player_name;
  }
  static urlRoot = "http://127.0.0.1:8001/status";
}
