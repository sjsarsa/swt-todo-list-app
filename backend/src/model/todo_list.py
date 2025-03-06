from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship, UniqueConstraint

from model.user import User


class TodoList(SQLModel, table=True):
    __tablename__ = "todo_list"  # type: ignore

    id: int = Field(default=None, primary_key=True)
    author_id: int = Field(foreign_key="users.id")
    name: str
    description: Optional[str] = None
    created: datetime = Field(default_factory=datetime.now)
    updated: datetime = Field(default_factory=datetime.now)

    # multi-column constraints
    __table_args__ = (
        UniqueConstraint(
            "name",
            "author_id",
            name="your_unique_constraint_name"
        ),
    )
    # relationships
    author: User = Relationship()
    # todo_items: list[TodoItem] = Relationship(back_populates="todo_list")
