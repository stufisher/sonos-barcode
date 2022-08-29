import { useSuspense, useSubscription, useController } from "rest-hooks";
import { Card, Grid, IconButton, List, ListItem, Slider } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import JoinFullIcon from "@mui/icons-material/JoinFull";
import JoinInnerIcon from "@mui/icons-material/JoinInner";
import VolumeDown from "@mui/icons-material/VolumeDown";
import VolumeUp from "@mui/icons-material/VolumeUp";
import { StatusResource } from "../resources/SonosStatus";
import noAlbumArt from "../assets/empty_album_art.png";

export default function Status() {
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
            onError={({ currentTarget }) => {
              currentTarget.onerror = null;
              currentTarget.src = noAlbumArt;
            }}
          />
        </Grid>
        <Grid item xs={7}>
          <List>
            <ListItem>
              {status.player_name}
              {status.coordinator_name !== status.player_name && (
                <>({status.coordinator_name})</>
              )}
              {status.members > 1 && <> +{status.members - 1}</>}
            </ListItem>
            <ListItem>Title: {status.title}</ListItem>
            <ListItem>Artist: {status.artist}</ListItem>
            <ListItem>Album: {status.album}</ListItem>

            {status.position !== "NOT_IMPLEMENTED" && (
              <ListItem>
                {status.position} / {status.duration}
              </ListItem>
            )}

            <ListItem>
              <IconButton
                size="large"
                onClick={(e) =>
                  fetch(StatusResource.update(), {}, { previous: true })
                }
              >
                <SkipPreviousIcon fontSize="inherit" />
              </IconButton>

              {(status.transport_state === "PAUSED_PLAYBACK" ||
                status.transport_state === "STOPPED") && (
                <IconButton
                  size="large"
                  onClick={(e) =>
                    fetch(StatusResource.update(), {}, { play: true })
                  }
                >
                  <PlayArrowIcon fontSize="inherit" />
                </IconButton>
              )}
              {status.transport_state !== "PAUSED_PLAYBACK" &&
                status.transport_state !== "STOPPED" && (
                  <IconButton
                    size="large"
                    onClick={(e) =>
                      fetch(StatusResource.update(), {}, { pause: true })
                    }
                  >
                    <PauseIcon fontSize="inherit" />
                  </IconButton>
                )}
              <IconButton
                size="large"
                onClick={(e) =>
                  fetch(StatusResource.update(), {}, { next: true })
                }
              >
                <SkipNextIcon fontSize="inherit" />
              </IconButton>

              <IconButton
                sx={{ marginLeft: "1rem" }}
                size="large"
                onClick={(e) =>
                  fetch(StatusResource.update(), {}, { isolate: true })
                }
              >
                <JoinInnerIcon fontSize="inherit" />
              </IconButton>

              <IconButton
                size="large"
                onClick={(e) =>
                  fetch(StatusResource.update(), {}, { join: true })
                }
              >
                <JoinFullIcon fontSize="inherit" />
              </IconButton>
            </ListItem>

            <ListItem>
              Zone:
              <VolumeDown />
              <Slider
                aria-label="Volume"
                value={status.volume}
                onChange={(event: Event, newValue: number | number[]) =>
                  fetch(
                    StatusResource.update(),
                    {},
                    { volume: newValue as number }
                  )
                }
              />
              <VolumeUp />
            </ListItem>
            {status.members > 1 && (
              <ListItem>
                Group:
                <VolumeDown />
                <Slider
                  aria-label="Group Volume"
                  value={status.group_volume}
                  onChange={(event: Event, newValue: number | number[]) =>
                    fetch(
                      StatusResource.update(),
                      {},
                      { group_volume: newValue as number }
                    )
                  }
                />
                <VolumeUp />
              </ListItem>
            )}
          </List>
        </Grid>
      </Grid>
    </Card>
  );
}
