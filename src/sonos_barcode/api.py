import asyncio
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_socketio import SocketManager
from starlette.responses import RedirectResponse
from starlette.staticfiles import StaticFiles

from .reader import HID
from .settings import settings
from .routes import router


app = FastAPI()
socket_manager = SocketManager(app=app, cors_allowed_origins=[])

if settings.cors:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


# https://gist.github.com/JoachimL/1629f701fdb38427091710fc0caef67d
# https://github.com/tiangolo/fastapi/issues/2713

reader = HID(app)
reader.start()


@app.on_event("startup")
async def app_startup():
    asyncio.create_task(reader.reader())
    loop = asyncio.get_event_loop()
    reader.set_loop(loop)


@app.on_event("shutdown")
async def app_shutdown():
    print("shutdown")
    reader.shutdown()


app.include_router(router, prefix="/api")


@app.get("/")
async def index():
    return RedirectResponse(url="/index.html")


app.mount("/", StaticFiles(directory=f"{os.path.dirname(__file__)}/dist/"), name="dist")
