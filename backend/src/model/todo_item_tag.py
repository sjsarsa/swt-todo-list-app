from datetime import datetime
from sqlmodel import SQLModel, Field


class TodoItemTag(SQLModel, table=True):
    todo_item_id: int = Field(foreign_key="todoitem.id", primary_key=True)
    tag_id: int = Field(foreign_key="tag.id", primary_key=True)
    created: datetime = Field(default_factory=datetime.now)
    updated: datetime = Field(default_factory=datetime.now)
