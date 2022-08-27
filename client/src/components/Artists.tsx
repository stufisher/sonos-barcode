import { useState } from "react";
import { useSuspense } from "rest-hooks";
import { List, ListItem, Button, IconButton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";

import { ArtistsResource } from "../resources/SonosArtists";

export default function Artists(props: any) {
  const [currentArtist, setCurrentArtist] = useState<string>("");
  const artists = useSuspense(ArtistsResource.list(), {
    search_term: props.searchTerm,
  });

  return (
    <>
      {currentArtist && (
        <List disablePadding={true}>
          <ListItem
            key={currentArtist}
            selected={true}
            secondaryAction={
              <IconButton edge="end" aria-label="clear" onClick={() => setCurrentArtist("")}>
                <ClearIcon />
              </IconButton>
            }
          >
            {currentArtist}
          </ListItem>
        </List>
      )}

      {!currentArtist && (
        <List
          style={{ display: "flex", flexWrap: "wrap" }}
          disablePadding={true}
        >
          {artists.results.map((artist) => (
            <ListItem key={artist.pk()} style={{ flex: "1 1 33%" }}>
              <Button
                fullWidth
                variant={
                  artist.title === currentArtist ? "contained" : "outlined"
                }
                onClick={() => {
                  props.selectArtist(artist.title);
                  setCurrentArtist(artist.title);
                }}
              >
                {artist.title}
              </Button>
            </ListItem>
          ))}
        </List>
      )}
    </>
  );
}
