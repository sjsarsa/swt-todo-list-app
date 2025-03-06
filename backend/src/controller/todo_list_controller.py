from http import HTTPStatus
from typing import List
from fastapi import APIRouter, HTTPException, Request
from starlette.authentication import requires
from dto.response_dtos import TodoListDto, TodoListMemberDto
from model.todo_list_role import TodoListRole
from service import todo_list_service
from dto.request_dtos import CreateTodoListRequest, CloneTodoListRequest, ShareTodoListRequest

from model.todo_list import TodoList

import logging

logger = logging.getLogger(__name__)

todo_list_router = APIRouter()


@todo_list_router.get("/")
@requires('authenticated')
async def find_todo_lists(request: Request) -> List[TodoListDto]:
    logger.info(f"Finding todo lists for user {request.user.user_id}")
    return await todo_list_service.find_todo_lists(user_id=request.user.user_id)


@todo_list_router.post("/")
@requires('authenticated')
async def create_todo_list(todo_list: CreateTodoListRequest, request: Request) -> TodoListDto:
    logger.info(f"Creating todo list for user {request.user.user_id}")
    return await todo_list_service.create_todo_list(author_id=request.user.user_id, **todo_list.model_dump())


@todo_list_router.get("/roles")
async def find_todo_list_roles() -> List[TodoListRole]:
    return await todo_list_service.find_todo_list_roles()


@todo_list_router.get("/{todo_list_id}")
@requires('authenticated')
async def find_todo_list(todo_list_id: int, request: Request) -> TodoListDto:
    logger.info(
        f"Finding todo list {todo_list_id} for user {request.user.user_id}")
    todo_list = await todo_list_service.find_todo_list(id=todo_list_id, user_id=request.user.user_id)
    if todo_list is None:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND,
                            detail=f"Todo list with id {todo_list_id} not found")
    return todo_list


@todo_list_router.put("/{todo_list_id}")
@requires('authenticated')
async def update_todo_list(todo_list_id: int, todo_list: CreateTodoListRequest, request: Request) -> TodoList:
    logger.info(
        f"Updating todo list {todo_list_id} for user {request.user.user_id}")
    await todo_list_service.authorize_todo_list_access(todo_list_id, request.user.user_id, ['owner'])
    return await todo_list_service.update_todo_list(id=todo_list_id, **todo_list.model_dump())


@todo_list_router.delete("/{todo_list_id}")
@requires('authenticated')
async def delete_todo_list(todo_list_id: int, request: Request) -> bool:
    logger.info(
        f"Deleting todo list {todo_list_id} for user {request.user.user_id}")
    await todo_list_service.authorize_todo_list_access(todo_list_id, request.user.user_id, ['owner'])
    return await todo_list_service.delete_todo_list(id=todo_list_id)


@todo_list_router.post("/{todo_list_id}/clone")
@requires('authenticated')
async def clone_todo_list(todo_list_id: int, todo_list_clone: CloneTodoListRequest, request: Request) -> TodoListDto:
    logger.info(
        f"Cloning todo list {todo_list_id} for user {request.user.user_id}")
    return await todo_list_service.clone_todo_list(id=todo_list_id, author_id=request.user.user_id, name=todo_list_clone.name)


@todo_list_router.post("/{todo_list_id}/share")
@requires('authenticated')
async def share_todo_list(todo_list_id: int, share_request: ShareTodoListRequest, request: Request) -> bool:
    logger.info(
        f"Sharing todo list {todo_list_id} for users {share_request.user_ids} with role {share_request.role_id}")
    await todo_list_service.authorize_todo_list_access(todo_list_id, request.user.user_id, ['owner'])
    await todo_list_service.add_todo_list_members(todo_list_id=todo_list_id, user_ids=share_request.user_ids, todo_list_role_id=share_request.role_id)
    return True

@todo_list_router.get("/{todo_list_id}/members")
@requires('authenticated')
async def find_todo_list_members(todo_list_id: int, request: Request) -> List[TodoListMemberDto]:
    logger.info(f"Finding members for todo list {todo_list_id}")
    await todo_list_service.authorize_todo_list_access(todo_list_id, request.user.user_id, ['editor', 'owner', 'viewer'])
    return await todo_list_service.find_todo_list_members(todo_list_id=todo_list_id)
