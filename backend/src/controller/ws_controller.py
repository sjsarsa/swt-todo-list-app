from typing import Annotated
from fastapi import (
    APIRouter,
    Depends,
    WebSocket,
    WebSocketDisconnect,
    WebSocketException,
    status as http_status,
)
from starlette.authentication import AuthenticationError
from core import jwt
from dto.response_dtos import UserDto
from service import todo_list_service
import json

from core.websocket import ConnectionManager


ws_router = APIRouter()
manager = ConnectionManager()


def authenticate(_websocket: WebSocket, access_token: str | None) -> UserDto:
    if access_token is None:
        raise WebSocketException(code=http_status.WS_1008_POLICY_VIOLATION)

    payload = jwt.decode(access_token)
    user_id = payload.get("user_id")
    username = payload.get("username")

    if not user_id or not username:
        raise AuthenticationError("Invalid token")

    return UserDto(id=user_id, username=username)



# Example websocket endpoint
@ws_router.websocket("/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_personal_message(f"You wrote: {data}", websocket)
            await manager.broadcast(f"Client #{client_id} says: {data}", websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(f"Client #{client_id} left the chat", websocket)


# Endpoint for shared editing of TodoList TodoItems (create, update, delete)
@ws_router.websocket("/todo-list/{todo_list_id}")
async def todo_list_websocket_endpoint(
    websocket: WebSocket,
    todo_list_id: int,
    user: Annotated[UserDto, Depends(authenticate)],
):
    await manager.connect(websocket)
    await manager.broadcast(
        json.dumps(
            {
                "action": "connect",
                "user": user.model_dump(),
            }
        ),
        websocket,
    )
    manager.data.setdefault("users", {})[user.id] = user.model_dump()

    todo_list = await todo_list_service.find_todo_list(id=todo_list_id, user_id=user.id)
    if todo_list is None:
        raise WebSocketException(code=http_status.WS_1008_POLICY_VIOLATION)

    data = manager.data
    if len(data) > 0:
        await manager.send_personal_message(
            json.dumps({"action": "init", "data": data}),
            websocket,
        )

    try:
        while True:
            data = json.loads(await websocket.receive_text())
            action = data.get("action")
            if action in (
                "todo_item_create",
                "todo_item_update",
                "todo_item_delete",
                "todo_item_open_for_editing",
                "todo_item_close_editing",
            ):
                await manager.broadcast(
                    json.dumps(
                        {
                            "action": action,
                            "todo_item_id": data.get("todo_item_id"),
                        }
                    ),
                    websocket,
                )

            elif action == "todo_item_edit_description":
                todo_item_id = data.get("todo_item_id")
                description = data.get("description")
                await manager.broadcast(
                    json.dumps(
                        {
                            "action": action,
                            "todo_item_id": todo_item_id,
                            "description": description,
                        }
                    ),
                    websocket,
                )
                todo_item_edit_state = manager.data.setdefault(
                    "todo_item_edit_state", {}
                )
                todo_item_edit_state.setdefault(
                    todo_item_id, {"description": description}
                )["description"] = description

            elif action == "disconnect":
                manager.disconnect(websocket)
                manager.data["users"].pop(user.id)
                await manager.broadcast(
                    json.dumps({"action": action, "user": user.model_dump()}),
                    websocket,
                )

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        manager.data["users"].pop(user.id)
        await manager.broadcast(
            json.dumps({"action": "disconnect", "user": user.model_dump()}),
            websocket,
        )
