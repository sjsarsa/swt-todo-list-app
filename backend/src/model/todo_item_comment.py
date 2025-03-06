from datetime import datetime
from sqlmodel import SQLModel, Field


class TodoItemComment(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    todo_item_id: int = Field(foreign_key="todoitem.id")
    user_id: int = Field(foreign_key="user.id")
    text: str
    created: datetime = Field(default_factory=datetime.now)
    updated: datetime = Field(default_factory=datetime.now)
