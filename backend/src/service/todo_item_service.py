from fastapi import HTTPException
from typing import List
from sqlalchemy import select, text, update
from dto.request_dtos import UpdateTodoItemRequest
from model import todo_list
from model.todo_item import TodoItem
from core.database import database
from datetime import date


@database.transaction()
async def find_todo_items(
    id: int | None = None,
    todo_list_id: int | None = None,
    author_id: int | None = None,
    user_id: int | None = None,
    completed: bool | None = None,
    limit: int | None = None,
) -> List[TodoItem]:
    sql = """
    SELECT ti.*
    FROM todo_item ti
    JOIN todo_list tl ON ti.todo_list_id = tl.id
    LEFT JOIN todo_list_member tlm ON tl.id = tlm.todo_list_id
    WHERE (ti.id = :id OR :id IS NULL)
      AND (tlm.user_id = :user_id OR tl.author_id = :user_id OR :user_id IS NULL)
      AND (ti.author_id = :author_id OR :author_id IS NULL)
      AND (ti.todo_list_id = :todo_list_id OR :todo_list_id IS NULL)
      AND (ti.completed = :completed OR :completed IS NULL)
    """
    if limit is not None:
        sql = sql + "\nLIMIT :limit\n"

    query = text(sql).bindparams(
        id=id,
        todo_list_id=todo_list_id,
        author_id=author_id,
        user_id=user_id,
        completed=completed,
    )
    query = select(TodoItem).from_statement(query)

    rows = await database.fetch_all(query=query)
    return database.map_to_models(rows, TodoItem)


@database.transaction()
async def create_todo_item(
    author_id: int, todo_list_id: int, description: str, due_date: date | None = None
) -> TodoItem:
    sql = """
    INSERT INTO todo_item (author_id, todo_list_id, description, due_date)
    VALUES (:author_id, :todo_list_id, :description, :due_date)
    RETURNING *
    """
    query = text(sql).bindparams(
        author_id=author_id,
        todo_list_id=todo_list_id,
        description=description,
        due_date=due_date,
    )
    row = await database.fetch_one(query=query)
    if row is None:
        raise HTTPException(status_code=500, detail="Failed to create todo item")
    return database.map_to_model(row, TodoItem)


@database.transaction()
async def find_todo_item(
    id: int, todo_list_id: int | None = None, user_id: int | None = None
) -> TodoItem | None:
    todo_items = await find_todo_items(
        id=id, todo_list_id=todo_list_id, user_id=user_id, limit=1
    )
    return todo_items[0] if todo_items else None


@database.transaction()
async def update_todo_item(id: int, values: UpdateTodoItemRequest) -> TodoItem:
    sql = f"""
    UPDATE todo_item
    SET
        description = :description,
        due_date = :due_date,
        completed = :completed,
        updated = NOW()
    WHERE id = :id
    RETURNING *
    """

    todo_item = await find_todo_item(id)
    if todo_item is None:
        raise HTTPException(status_code=404, detail=f"Todo item with id {id} not found")

    for key, value in values.model_dump(exclude_unset=True).items():
        setattr(todo_item, key, value)

    query = text(sql).bindparams(
        id=id,
        description=todo_item.description,
        due_date=todo_item.due_date,
        completed=todo_item.completed,
    )

    row = await database.fetch_one(query=query)
    if row is None:
        raise HTTPException(status_code=500, detail="Failed to update todo item")
    return database.map_to_model(row, TodoItem)


@database.transaction()
async def delete_todo_item(id: int, todo_list_id: int) -> bool:
    sql = """
    DELETE FROM todo_item
    WHERE id = :id AND todo_list_id = :todo_list_id
    RETURNING *
    """
    query = text(sql).bindparams(id=id, todo_list_id=todo_list_id)
    deleted = await database.execute(query=query)
    return deleted is not None


@database.transaction()
async def clone_todo_item(id: int, author_id: int, todo_list_id: int) -> TodoItem:
    todo_item = await find_todo_item(id)
    if todo_item is None:
        raise HTTPException(status_code=404, detail=f"Todo item with id {id} not found")

    return await create_todo_item(
        author_id=author_id,
        todo_list_id=todo_list_id,
        description=todo_item.description + " (cloned)",
        due_date=todo_item.due_date,
    )
