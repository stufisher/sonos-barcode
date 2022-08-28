import { useEffect } from "react";
import { useSuspense } from "rest-hooks";
import { EANResource } from "../resources/EAN";

interface IBarcode {
  barcode: string;
}

export default function Barcode(props: IBarcode) {
  useSuspense(EANResource.detail(), {
    barcode: props.barcode,
  });

  return <></>;
}
