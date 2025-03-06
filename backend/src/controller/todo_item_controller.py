from typing import List
from fastapi import APIRouter, Request
from starlette.authentication import requires
from service import todo_item_service, todo_list_service
from dto.request_dtos import CreateTodoItemRequest, UpdateTodoItemRequest

from model.todo_item import TodoItem

import logging

logger = logging.getLogger(__name__)

todo_item_router = APIRouter()


@todo_item_router.get("/{todo_list_id}/todos")
@requires('authenticated')
async def find_todo_items(todo_list_id: int, request: Request) -> List[TodoItem]:
    logger.info(
        f"Finding todos for todo list {todo_list_id} for user {request.user.user_id}")
    return await todo_item_service.find_todo_items(todo_list_id=todo_list_id, user_id=request.user.user_id)


@todo_item_router.get("/{todo_list_id}/todos/{todo_item_id}")
@requires('authenticated')
async def get_todo_item(todo_list_id: int, todo_item_id: int, request: Request) -> TodoItem | None:
    logger.info(
        f"Getting todo {todo_item_id} for todo list {todo_list_id} for user {request.user.user_id}")
    await todo_list_service.authorize_todo_list_access(todo_list_id, request.user.user_id, ['owner', 'editor', 'viewer'])
    return await todo_item_service.find_todo_item(todo_list_id=todo_list_id, user_id=request.user.user_id, id=todo_item_id)


@todo_item_router.post("/{todo_list_id}/todos")
@requires('authenticated')
async def create_todo_item(todo_list_id: int, todo_item: CreateTodoItemRequest, request: Request) -> TodoItem:
    logger.info(
        f"Creating todo for todo list {todo_list_id} for user {request.user.user_id}")
    await todo_list_service.authorize_todo_list_access(todo_list_id, request.user.user_id, ['owner', 'editor'])
    return await todo_item_service.create_todo_item(author_id=request.user.user_id, todo_list_id=todo_list_id, **todo_item.model_dump())


@todo_item_router.put("/{todo_list_id}/todos/{todo_item_id}")
@requires('authenticated')
async def update_todo_item(todo_list_id: int, todo_item_id: int, todo_item_values: UpdateTodoItemRequest, request: Request) -> TodoItem:
    logger.info(
        f"Updating todo {todo_item_id} for todo list {todo_list_id} for user {request.user.user_id}")
    await todo_list_service.authorize_todo_list_access(todo_list_id, request.user.user_id, ['owner', 'editor'])
    return await todo_item_service.update_todo_item(
        id=todo_item_id,
        values=todo_item_values
    )


@todo_item_router.delete("/{todo_list_id}/todos/{todo_item_id}")
@requires('authenticated')
async def delete_todo_item(todo_list_id: int, todo_item_id: int, request: Request) -> bool:
    logger.info(
        f"Deleting todo {todo_item_id} for todo list {todo_list_id} for user {request.user.user_id}")
    await todo_list_service.authorize_todo_list_access(todo_list_id, request.user.user_id, ['owner', 'editor'])
    return await todo_item_service.delete_todo_item(id=todo_item_id, todo_list_id=todo_list_id)


@todo_item_router.post("/{todo_list_id}/todos/{todo_item_id}/clone")
@requires('authenticated')
async def clone_todo_item(todo_list_id: int, todo_item_id: int, request: Request) -> TodoItem:
    logger.info(
        f"Cloning todo {todo_item_id} for todo list {todo_list_id} for user {request.user.user_id}")
    await todo_list_service.authorize_todo_list_access(todo_list_id, request.user.user_id, ['owner', 'editor'])
    return await todo_item_service.clone_todo_item(id=todo_item_id, author_id=request.user.user_id, todo_list_id=todo_list_id)
