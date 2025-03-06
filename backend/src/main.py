from fastapi import FastAPI, Request, status
from fastapi.requests import HTTPConnection
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.authentication import AuthenticationMiddleware
from contextlib import asynccontextmanager

from core.database import database
from core.middleware.authentication import AuthBackend

from controller.user_controller import user_router
from controller.todo_list_controller import todo_list_router
from controller.todo_item_controller import todo_item_router
from controller.ws_controller import ws_router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await database.connect()
    yield
    await database.disconnect()


def on_auth_error(_connection: HTTPConnection, exception: Exception):
    return JSONResponse(content={"detail": str(exception)}, status_code=status.HTTP_401_UNAUTHORIZED)


app = FastAPI(lifespan=lifespan)
app.include_router(user_router, prefix="/api/users", tags=["users"])
app.include_router(
    todo_list_router, prefix="/api/todo-lists", tags=["todo-lists"])
app.include_router(
    todo_item_router, prefix="/api/todo-lists", tags=["todo-items"])
app.include_router(ws_router, prefix="/ws", tags=["websockets"])

app.add_middleware(AuthenticationMiddleware,
                   backend=AuthBackend(), on_error=on_auth_error)
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost', 'http://localhost:4321'],  # TODO: swithc through env
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['Authorization', 'Content-Type']
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_request: Request, exception: RequestValidationError):
    return JSONResponse(content={"detail": str(exception)}, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)
