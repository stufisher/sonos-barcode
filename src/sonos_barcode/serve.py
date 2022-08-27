import uvicorn


def run():
    uvicorn.run("sonos_barcode.api:app", host="0.0.0.0", port=8001, reload=True)


if __name__ == "__main__":
    run()
