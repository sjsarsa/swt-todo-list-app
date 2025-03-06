from datetime import datetime
from sqlmodel import Relationship, SQLModel, Field

from model.user import User


class TodoItemAssignee(SQLModel, table=True):
    todo_item_id: int = Field(foreign_key="todoitem.id", primary_key=True)
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    created: datetime = Field(default_factory=datetime.now)
    updated: datetime = Field(default_factory=datetime.now)

    # relationships
    user: User = Relationship()
