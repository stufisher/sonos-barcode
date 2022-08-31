import { Resource, EndpointExtraOptions } from "@rest-hooks/rest";
import config from "../config";

export class EANResource extends Resource {
  barcode: string;
  entity: string;

  static getEndpointExtra(): EndpointExtraOptions {
    return { dataExpiryLength: 1000, invalidIfStale: true };
  }

  pk() {
    return this.barcode;
  }
  static urlRoot = `${config.baseUrl}/barcode`;
}
