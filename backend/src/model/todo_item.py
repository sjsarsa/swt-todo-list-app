from typing import Optional
from datetime import datetime, date
from sqlmodel import SQLModel, Field, Relationship

from model.user import User
from model.todo_list import TodoList


class TodoItem(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    author_id: int = Field(foreign_key='users.id')
    todo_list_id: int = Field(foreign_key="todo_list.id")
    description: str
    due_date: Optional[date] = None
    completed: bool = Field(default=False)
    created: datetime = Field(default_factory=datetime.now)
    updated: datetime = Field(default_factory=datetime.now)

    # relationships
    author: User = Relationship()
    todo_list: TodoList = Relationship()
