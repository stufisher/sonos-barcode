import { Button } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { useState } from "react";

interface IAZ {
  onChange: (az: string) => void;
}

export default function AZ(props: IAZ) {
  const [currentFirst, setCurrentFirst] = useState<number>(0);
  const [currentSecond, setCurrentSecond] = useState<number>(0);

  function searchArtists(currentSecond: number) {
    setCurrentSecond(currentSecond);
    props.onChange(
      String.fromCharCode(currentFirst + 65) +
        String.fromCharCode(currentSecond + 65)
    );
  }

  return (
    <div>
      <Box display="flex" style={{ overflowX: "scroll" }} mb={1} pb={1}>
        <Stack direction="row" spacing={1}>
          {Array.from(Array(26).keys()).map((i) => (
            <Button
              key={`first-${i}`}
              variant={currentFirst === i ? "contained" : "outlined"}
              onClick={() => setCurrentFirst(i)}
              style={{ flex: 1 }}
            >
              {String.fromCharCode(i + 65)}
            </Button>
          ))}
        </Stack>
      </Box>
      <Box display="flex" style={{ overflowX: "scroll" }} mb={1} pb={1}>
        <Stack direction="row" spacing={1}>
          {Array.from(Array(26).keys()).map((i) => (
            <Button
              key={`second-${i}`}
              variant={currentSecond === i ? "contained" : "outlined"}
              onClick={() => searchArtists(i)}
              style={{ flex: 1 }}
            >
              {String.fromCharCode(currentFirst + 65)}
              {String.fromCharCode(i + 97)}
            </Button>
          ))}
        </Stack>
      </Box>
    </div>
  );
}
