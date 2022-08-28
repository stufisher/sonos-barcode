import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import io from "socket.io-client";
import { Box } from "@mui/system";
import { TextField, IconButton, InputAdornment } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import config from "../config";

const socket = io(config.baseUrl.replace("/api", ""), {
  path: "/ws/socket.io",
});

function debounce(func: Function, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null;
  return function (this: void) {
    const context = this;
    const args = arguments;
    const later = function () {
      timeout = null;
      func.apply(context, args);
    };
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

interface IBarcodeInput {
  barcode: string;
  onChange: (barcode: string) => void;
  children?: React.ReactNode;
}

export default function BarcodeInput(props: IBarcodeInput) {
  const { barcode, onChange, children } = props;
  const inputRef = useRef<HTMLInputElement | null>();
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("barcode", (barcode) => {
      if (inputRef.current) inputRef.current.value = barcode;
      onChange(barcode);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("barcode");
    };
  }, [onChange]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.value = barcode;
  }, [barcode]);

  const change = useCallback(
    (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target) onChange(target.value);
    },
    [onChange]
  );

  const onClear = useCallback(() => {
    onChange("");
  }, [onChange]);

  const debouncedOnChange = useMemo(() => debounce(change, 1000), [change]);

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
              {barcode && (
                <IconButton onClick={onClear}>
                  <ClearIcon />
                </IconButton>
              )}
              {isConnected && (
                <IconButton>
                  <PowerSettingsNewIcon />
                </IconButton>
              )}
              {children}
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}
