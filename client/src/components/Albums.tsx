import React from "react";
import { useSuspense } from "rest-hooks";
import { ImageList, ImageListItem, ImageListItemBar } from "@mui/material";

import { AlbumsResource } from "../resources/SonosAlbums";

interface IAlbums {
  artist: string;
  selectAlbum: (album: string) => void;
}

export default function Albums(props: IAlbums) {
  const albums = useSuspense(AlbumsResource.list(), {
    artist: props.artist,
  });
  return (
    <ImageList cols={4}>
      {albums.results.map((album) => (
        <ImageListItem
          key={album.pk()}
          onClick={() => props.selectAlbum(album.item_id)}
          sx={{ cursor: "pointer" }}
        >
          <img
            style={{ width: "100%" }}
            src={album.album_art_uri}
            alt={album.title}
            loading="lazy"
          />
          <ImageListItemBar title={album.title} />
        </ImageListItem>
      ))}
    </ImageList>
  );
}
