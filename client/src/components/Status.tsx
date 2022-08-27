import { useSuspense, useSubscription, useController } from "rest-hooks";
import { Card, Grid, IconButton, List, ListItem } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";

import { StatusResource } from "../resources/SonosStatus";

interface IStatus {}

export default function Status(props: IStatus) {
  const status = useSuspense(StatusResource.detail(), {});
  const { fetch } = useController();
  useSubscription(StatusResource.detail(), {});

  return (
    <Card style={{ marginBottom: "1rem" }}>
      <Grid container>
        <Grid item xs={5}>
          <img
            src={status.album_art_uri}
            alt={status.title}
            loading="lazy"
            style={{ padding: "0.5rem", width: "100%" }}
          />
        </Grid>
        <Grid item xs={7}>
          <List>
            <ListItem>
              {status.player_name} ({status.coordinator_name})
            </ListItem>
            <ListItem>Title: {status.title}</ListItem>
            <ListItem>Artist: {status.artist}</ListItem>
            <ListItem>Album: {status.album}</ListItem>
            <ListItem>
              {status.position} / {status.duration}
            </ListItem>
            <ListItem>
              <IconButton
                size="large"
                onClick={(e) =>
                  fetch(StatusResource.update(), {}, { previous: true })
                }
              >
                <SkipPreviousIcon />
              </IconButton>

              {status.transport_state === "PAUSED_PLAYBACK" && (
                <IconButton
                  size="large"
                  onClick={(e) =>
                    fetch(StatusResource.update(), {}, { play: true })
                  }
                >
                  <PlayArrowIcon />
                </IconButton>
              )}
              {status.transport_state !== "PAUSED_PLAYBACK" && (
                <IconButton
                  size="large"
                  onClick={(e) =>
                    fetch(StatusResource.update(), {}, { pause: true })
                  }
                >
                  <PauseIcon />
                </IconButton>
              )}
              <IconButton
                size="large"
                onClick={(e) =>
                  fetch(StatusResource.update(), {}, { next: true })
                }
              >
                <SkipNextIcon />
              </IconButton>
            </ListItem>
          </List>
        </Grid>
      </Grid>
    </Card>
  );
}
