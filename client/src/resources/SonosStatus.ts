import { Resource, EndpointExtraOptions } from "@rest-hooks/rest";
import config from "../config";

export enum PlayMode {
  QUEUE = "QUEUE",
  LINEIN = "LINEIN",
  RADIO = "RADIO",
  TV = "TV",
}

export class StatusResource extends Resource {
  player_name: string;
  coordinator_name: string;
  title: string;
  artist: string;
  album: string;
  album_art_uri: string;
  playlist_position: number;
  position: string;
  duration: string;
  transport_state: string;
  volume: number;
  group_volume: number;
  members: number;
  play_mode: PlayMode;

  static getEndpointExtra(): EndpointExtraOptions {
    return {
      pollFrequency: 1000,
    };
  }

  pk() {
    return this.player_name;
  }
  static urlRoot = `${config.baseUrl}/status`;
}
