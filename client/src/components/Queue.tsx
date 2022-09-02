import {
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListSubheader,
  Popover,
  Typography,
} from "@mui/material";
import { Suspense } from "react";
import { useSuspense, useSubscription } from "rest-hooks";
import { QueueResource } from "../resources/SonosQueue";

function QueueList({ currentItem }: { currentItem?: number }) {
  const queue = useSuspense(QueueResource.list(), {});
  useSubscription(QueueResource.list(), {});

  return (
    <List
      subheader={
        <ListSubheader disableSticky={true}>
          Queue ({queue.total})
        </ListSubheader>
      }
    >
      {queue.results.map((item, itemNumber) => (
        <ListItem key={item.item_id} selected={itemNumber + 1 === currentItem}>
          <ListItemAvatar>
            <Avatar alt="Remy Sharp" src={item.album_art_uri} />
          </ListItemAvatar>
          <ListItemText
            primary={item.title}
            secondary={
              <>
                <div>{item.creator}</div>
                <Typography variant="caption" gutterBottom>
                  {item.album}
                </Typography>
              </>
            }
          />
        </ListItem>
      ))}
    </List>
  );
}

export default function Queue({
  show,
  onClose,
  currentItem,
}: {
  show: boolean;
  onClose: () => void;
  currentItem?: number;
}) {
  return (
    <>
      {show && (
        <Popover
          open={show}
          anchorReference="anchorPosition"
          anchorPosition={{ top: 0, left: 0 }}
          onClose={() => onClose()}
        >
          <Suspense fallback={<p>Loading Queue...</p>}>
            <QueueList currentItem={currentItem} />
          </Suspense>
        </Popover>
      )}
    </>
  );
}
