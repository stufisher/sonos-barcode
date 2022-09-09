import asyncio
import time
import threading

from starlette.types import ASGIApp

try:
    import hid
except ImportError:
    hid = None


HID_LOOKUP = {
    0x04: "a",
    0x05: "b",
    0x06: "c",
    0x07: "d",
    0x08: "e",
    0x09: "f",
    0x0A: "g",
    0x0B: "h",
    0x0C: "i",
    0x0D: "j",
    0x0E: "k",
    0x0F: "l",
    0x10: "m",
    0x11: "n",
    0x12: "o",
    0x13: "p",
    0x14: "q",
    0x15: "r",
    0x16: "s",
    0x17: "t",
    0x18: "u",
    0x19: "v",
    0x1A: "w",
    0x1B: "x",
    0x1C: "y",
    0x1D: "z",
    0x1E: "1",
    0x1F: "2",
    0x20: "3",
    0x21: "4",
    0x22: "5",
    0x23: "6",
    0x24: "7",
    0x25: "8",
    0x26: "9",
    0x27: "0",
}


class Reader(threading.Thread):
    def __init__(self, app: ASGIApp):
        super().__init__()
        self._loop = None
        self._app = app
        self._running = True
        self._queue = asyncio.Queue()

    def set_loop(self, loop: asyncio.BaseEventLoop) -> None:
        self._loop = loop

    def run(self) -> None:
        raise NotImplementedError()

    # https://stackoverflow.com/questions/32889527/is-there-a-way-to-use-asyncio-queue-in-multiple-threads
    def queue(self, barcode: str) -> None:
        print("queuing", barcode)
        if self._loop:
            self._loop.call_soon_threadsafe(self._queue.put_nowait, barcode)

    async def reader(self) -> None:
        while True:
            barcode = await self._queue.get()
            print("emitting", barcode)
            if self._app:
                await self._app.sio.emit("barcode", barcode)

            print("emitted, loop")

    def shutdown(self) -> None:
        self._running = False
        self.join()


class HID(Reader):
    def __init__(self, app: ASGIApp, vendor_id: bytes, product_id: bytes):
        super().__init__(app)
        self._vendor_id = vendor_id
        self._product_id = product_id

    def run(self):
        try:
            hid_device = hid.device()
            hid_device.open(self._vendor_id, self._product_id)
            print("Reader: Started")
        except OSError:
            print("Reader: Couldn't open device", self._vendor_id, self._product_id)
            return

        print(f"  Manufacturer: {hid_device.get_manufacturer_string()}")
        print(f"  Product: {hid_device.get_product_string()}")
        print(f"  Serial No: {hid_device.get_serial_number_string()}")

        hid_device.set_nonblocking(1)
        hid_device.write([0, 63, 35, 35] + [0] * 61)

        time.sleep(0.05)

        while self._running:
            try:
                characters = []
                while self._running:
                    read_data = hid_device.read(64)
                    if read_data:
                        # enter key
                        if read_data[2] == 40:
                            self.queue("".join(characters))
                            characters = []
                            print("read")
                        else:
                            char = read_data[2]
                            if char == 0:
                                continue

                            if char in HID_LOOKUP:
                                characters.append(HID_LOOKUP[char])
                            else:
                                print("Got unknown char", char)
                                time.sleep(0.5)
                                hid_device.write([0, 63, 35, 35] + [0] * 61)

            except Exception as e:
                print("exception", str(e))
                time.sleep(1)
                # logger.exception("Couldnt read data")


if __name__ == "__main__":
    reader = HID(None, 0x2010, 0x7638)
    try:
        reader.start()
    except KeyboardInterrupt:
        print("shutdown")
        reader.shutdown()
