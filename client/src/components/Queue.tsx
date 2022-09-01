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
import { QueueItem } from "../resources/SonosStatus";

export default function Queue({
  items,
  show,
  onClose,
  currentItem,
}: {
  items: Array<QueueItem>;
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
          <List
            subheader={
              <ListSubheader disableSticky={true}>
                Queue ({items.length})
              </ListSubheader>
            }
          >
            {items.map((item, itemNumber) => (
              <ListItem
                key={item.item_id}
                selected={itemNumber + 1 === currentItem}
              >
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
        </Popover>
      )}
    </>
  );
}
