from http import HTTPStatus
from typing import List
from fastapi import HTTPException
from sqlalchemy import text
from dto.response_dtos import TodoListDto, TodoListMemberDto, TodoListRoleDto, UserDto
from model.role import Role
from model.todo_list_role import TodoListRole
from model.todo_list import TodoList
from core.database import database
from service import todo_item_service


async def authorize_todo_list_access(todo_list_id: int, user_id: int, roles: list[Role]) -> bool:
    todo_list = await find_todo_list(todo_list_id, user_id)
    if todo_list is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND, detail=f"Todo list with id {todo_list_id} not found"
        )
    if todo_list.role not in roles:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN, detail="You do not have permission to perform this action"
        )
    return True


@database.transaction()
async def find_todo_lists(
    id: int | None = None,
    user_id: int | None = None,
    name: str | None = None,
    limit: int | None = None,
) -> List[TodoListDto]:
    sql = """
    SELECT tl.*, 'owner' as role, u.username as author_username
    FROM todo_list tl
    JOIN users u ON tl.author_id = u.id
    WHERE (tl.id = :id OR :id IS NULL)
      AND (tl.author_id = :user_id OR :user_id IS NULL) 
      AND (tl.name = :name OR :name IS NULL)
    UNION
    SELECT tl.*, tlr.name as role, u.username as author_username
    FROM todo_list tl
    JOIN todo_list_member tlm ON tl.id = tlm.todo_list_id
    JOIN users u ON tl.author_id = u.id
    JOIN todo_list_role tlr ON tlm.todo_list_role_id = tlr.id
    WHERE (tl.id = :id OR :id IS NULL)
      AND (tlm.user_id = :user_id OR :user_id IS NULL)
      AND (tl.name = :name OR :name IS NULL)
    """
    if limit:
        sql = sql + f"\nLIMIT {limit}\n"
    query = text(sql).bindparams(id=id, name=name, user_id=user_id)
    rows = await database.fetch_all(query=query)
    return [TodoListDto.from_raw(**row) for row in rows]  # type: ignore


@database.transaction()
async def find_todo_list(id: int, user_id: int | None = None) -> TodoListDto | None:
    todo_lists = await find_todo_lists(id=id, user_id=user_id, limit=1)
    return todo_lists[0] if todo_lists else None


@database.transaction()
async def create_todo_list(
    author_id: int, name: str, description: str | None = None
) -> TodoListDto:
    sql = """
    INSERT INTO todo_list (author_id, name, description)
    VALUES (:author_id, :name, :description)
    RETURNING *
    """
    query = text(sql).bindparams(
        author_id=author_id, name=name, description=description
    )
    row = await database.fetch_one(query=query)
    if row is None:
        raise HTTPException(
            status_code=500, detail="Failed to create todo list")
    todo_list = await find_todo_list(row["id"])
    if todo_list is None:
        raise HTTPException(
            status_code=500, detail="Failed to fetch created todo list"
        )
    return todo_list


@database.transaction()
async def update_todo_list(
    id: int, name: str | None = None, description: str | None = None
) -> TodoList:
    sql = """
    UPDATE todo_list
    SET name = :name, description = :description
    WHERE id = :id
    RETURNING *
    """
    query = text(sql).bindparams(id=id, name=name, description=description)
    row = await database.fetch_one(query=query)
    if row is None:
        raise HTTPException(
            status_code=500, detail=f"Could not fetch updated todo list with id {id}"
        )
    return database.map_to_model(row, TodoList)


@database.transaction()
async def delete_todo_list(id: int) -> bool:
    sql = """
    DELETE FROM todo_list_member
    WHERE todo_list_id = :id
    """
    query = text(sql).bindparams(id=id)
    await database.execute(query=query)

    sql = """
    DELETE FROM todo_list
    WHERE id = :id
    """
    query = text(sql).bindparams(id=id)
    await database.execute(query=query)
    return True


@database.transaction()
async def clone_todo_list(id: int, author_id: int, name: str) -> TodoListDto:
    todo_list = await find_todo_list(id=id)
    if todo_list is None:
        raise HTTPException(
            status_code=404, detail=f"Todo list with id {id} not found")

    existing_todo_lists = await find_todo_lists(user_id=author_id, name=name)
    if len(existing_todo_lists) > 0:
        raise HTTPException(
            status_code=400,
            detail=f"User {author_id} already has a todo list with name {name}",
        )

    todo_items = await todo_item_service.find_todo_items(todo_list_id=id)

    cloned = await create_todo_list(
        author_id=author_id, name=name, description=todo_list.description
    )
    for todo_item in todo_items:
        await todo_item_service.create_todo_item(
            author_id=author_id,
            todo_list_id=cloned.id,
            description=todo_item.description,
            due_date=todo_item.due_date,
        )

    return TodoListDto.from_raw(
        id=cloned.id,
        name=cloned.name,
        description=cloned.description,
        author_id=author_id,
        role="owner",
        author_username=todo_list.author.username,
        created=cloned.created,
        updated=cloned.updated,
    )


@database.transaction()
async def add_todo_list_members(
    todo_list_id: int, user_ids: list[int], todo_list_role_id: int
) -> bool:
    sql = """
    INSERT INTO todo_list_member (todo_list_id, user_id, todo_list_role_id)
    VALUES (:todo_list_id, :user_id, :todo_list_role_id)
    """
    query = text(sql)
    for user_id in user_ids:
        await database.execute(
            query=query.bindparams(
                todo_list_id=todo_list_id,
                user_id=user_id,
                todo_list_role_id=todo_list_role_id,
            )
        )
    return True


@database.transaction()
async def find_todo_list_members(todo_list_id: int) -> list[TodoListMemberDto]:
    sql = """
    SELECT u.id as user_id, u.username, tlr.id as todo_list_role_id, tlr.name as todo_list_role_name
    FROM todo_list_member m
    JOIN users u ON m.user_id = u.id
    JOIN todo_list_role tlr ON m.todo_list_role_id = tlr.id
    WHERE m.todo_list_id = :todo_list_id
    """
    query = text(sql).bindparams(todo_list_id=todo_list_id)
    rows = await database.fetch_all(query=query)

    return [
        TodoListMemberDto.from_user_and_role_dtos(
            UserDto(id=row["user_id"], username=row["username"]),
            TodoListRoleDto(
                id=row["todo_list_role_id"], name=row["todo_list_role_name"]
            ),
        )
        for row in rows
    ]


@database.transaction()
async def find_todo_list_roles() -> List[TodoListRole]:
    sql = """
    SELECT * 
    FROM todo_list_role
    """
    query = text(sql)
    rows = await database.fetch_all(query=query)
    return database.map_to_models(rows, TodoListRole)
