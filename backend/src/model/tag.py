from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class Tag(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    author_id: int = Field(foreign_key="user.id")
    category: Optional[str] = Field(
        default=None, foreign_key="tag_category.name")
    name: str = Field(unique=True, nullable=False)
    color: str = Field(default='#000000')
    created: datetime = Field(default_factory=datetime.now)
    updated: datetime = Field(default_factory=datetime.now)
