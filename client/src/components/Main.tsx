import { Suspense, useState } from "react";
import BarcodeInput from "./BarcodeInput";
import { EANResource } from "../resources/EAN";
import { NetworkErrorBoundary, useController, NetworkError } from "rest-hooks";
import Status from "./Status";
import Barcode from "./Barcode";
import Selector from "./Selector";

export default function Main(props: any) {
  const [currentBarcode, setCurrentBarcode] = useState<string>("");
  const { fetch } = useController();

  function onSave(album: string) {
    fetch(
      EANResource.create(),
      {},
      {
        barcode: currentBarcode,
        entity: album,
      }
    ).then(() => {
        setCurrentBarcode("")
    });
  }

  function SelectorWrapper({ error }: { error: NetworkError }) {
    return error.status === 404 ? (
      <Selector onSave={onSave} />
    ) : (
      <p>An error occured</p>
    );
  }

  return (
    <div>
      <BarcodeInput onChange={setCurrentBarcode} barcode={currentBarcode} />
      {currentBarcode && (
        <NetworkErrorBoundary fallbackComponent={SelectorWrapper}>
          <Suspense fallback={<div>Loading Barcode</div>}>
            <Barcode barcode={currentBarcode} />
          </Suspense>
        </NetworkErrorBoundary>
      )}
      <Suspense fallback={<div>Loading Status</div>}>
        <Status />
      </Suspense>
    </div>
  );
}
