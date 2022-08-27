import { Resource } from "@rest-hooks/rest";

export class EANResource extends Resource {
  barcode: string;
  entity: string;

  static getRequestOptions() {
    return { dataExpiryLength: 1000, invalidIfStale: true };
  }

  pk() {
    return this.barcode;
  }
  static urlRoot = "http://127.0.0.1:8001/barcode";
}
