import { Suspense, useState } from "react";
import AZ from "./AZ";
import Artists from "./Artists";
import Albums from "./Albums";

interface ISelector {
  onSave: (props: any) => void
}

export default function Selector(props: ISelector) {
  const [searchTerm, setSearchTerm] = useState<string>("Aa");
  const [selectedArtist, setSelectedArtist] = useState<string>("Aa");

  return (
    <div>
      <AZ onChange={setSearchTerm} />
      <Suspense fallback={<div>Loading Artists</div>}>
        <Artists selectArtist={setSelectedArtist} searchTerm={searchTerm} />
      </Suspense>
      <Suspense fallback={<div>Loading Albums</div>}>
        <Albums artist={selectedArtist} selectAlbum={props.onSave} />
      </Suspense>
    </div>
  );
}
