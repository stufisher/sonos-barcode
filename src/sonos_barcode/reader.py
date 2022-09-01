import asyncio
import time
import threading

from starlette.types import ASGIApp

try:
    import hid
except ImportError:
    hid = None


HID_LOOKUP = {
    30: 1,
    31: 2,
    32: 3,
    33: 4,
    34: 5,
    35: 6,
    36: 7,
    37: 8,
    38: 9,
    39: 0,
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
                                characters.append(str(HID_LOOKUP[char]))
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
