import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import io from "socket.io-client";
import { Box } from "@mui/system";
import { TextField, IconButton, InputAdornment } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";

const socket = io("http://localhost:8001", {
  path: "/ws/socket.io",
});

function debounce(func, wait) {
  let timeout;
  return function () {
    const context = this;
    const args = arguments;
    const later = function () {
      timeout = null;
      func.apply(context, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default function BarcodeInput(props) {
  const inputRef = useRef();
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("barcode", (barcode) => {
      inputRef.current.value = barcode;
      props.onChange(barcode);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("barcode");
    };
  }, [props.onChange]);

  useEffect(() => {
    inputRef.current.value = props.barcode;
  }, [props.barcode]);

  const onChange = useCallback(
    (event) => {
      props.onChange(event.target.value);
    },
    [props.onChange]
  );

  const onClear = useCallback(() => {
    props.onChange("");
  }, [props.onChange]);

  const debouncedOnChange = useMemo(() => debounce(onChange, 1000), [onChange]);

  return (
    <Box my={1}>
      <TextField
        variant="filled"
        fullWidth
        inputRef={inputRef}
        onChange={debouncedOnChange}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {props.barcode && (
                <IconButton onClick={onClear}>
                  <ClearIcon />
                </IconButton>
              )}
              {isConnected && (
                <IconButton>
                  <PowerSettingsNewIcon />
                </IconButton>
              )}
              {props.children}
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}
