import { useEffect } from "react";
import { useSuspense } from "rest-hooks";
import { EANResource } from "../resources/EAN";

interface IBarcode {
  barcode: string;
}

export default function Barcode(props: IBarcode) {
  useEffect(() => {
    console.log("Remounting Barcode")
  }, [])

  console.log("BARCODE current barcode", props.barcode)
  useSuspense(EANResource.detail(), {
    barcode: props.barcode,
  });

  return <></>;
}
