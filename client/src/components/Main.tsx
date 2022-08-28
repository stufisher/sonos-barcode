import { Suspense, useState } from "react";
import BarcodeInput from "./BarcodeInput";
import { EANResource } from "../resources/EAN";
import { AlbumsResource } from "../resources/SonosAlbums";
import { NetworkErrorBoundary, useController, NetworkError } from "rest-hooks";
import { IconButton } from "@mui/material";
import AlbumIcon from "@mui/icons-material/Album";

import Status from "./Status";
import Barcode from "./Barcode";
import Selector from "./Selector";

export default function Main(props: any) {
  const [currentBarcode, setCurrentBarcode] = useState<string>("");
  const [selectAlbum, setSelectAlbum] = useState<boolean>(false);
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
      setCurrentBarcode("");
    });
  }

  function loadAlbum(album: string) {
    fetch(
      AlbumsResource.create(),
      {},
      {
        item_id: album,
      }
    );
    setSelectAlbum(false);
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
      <BarcodeInput onChange={setCurrentBarcode} barcode={currentBarcode}>
        <IconButton onClick={() => setSelectAlbum(!selectAlbum)}>
          <AlbumIcon />
        </IconButton>
      </BarcodeInput>
      {selectAlbum && <Selector onSave={loadAlbum} />}
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
