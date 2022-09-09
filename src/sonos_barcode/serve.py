import argparse
import uvicorn


def run():
    parser = argparse.ArgumentParser(description="Sonos Barcode server")
    parser.add_argument(
        "-p", "--port", dest="port", default=8001, help="REST server port", type=int
    )
    parser.add_argument(
        "--reload",
        action="store_true",
        dest="reload",
        default=False,
        help="Enable reloader for debugging",
    )
    args = parser.parse_args()

    uvicorn.run(
        "sonos_barcode.api:app", host="0.0.0.0", port=args.port, reload=args.reload
    )


if __name__ == "__main__":
    run()
