from datetime import datetime
from sqlmodel import SQLModel, Field


class TodoListMember(SQLModel, table=True):
    todo_list_id: int = Field(foreign_key="todolist.id", primary_key=True)
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    todo_list_role: int = Field(foreign_key="todo_list_role.id")
    created: datetime = Field(default_factory=datetime.now)
    updated: datetime = Field(default_factory=datetime.now)
