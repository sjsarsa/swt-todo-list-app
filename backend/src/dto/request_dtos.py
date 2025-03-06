from pydantic import BaseModel
from typing import Optional


class CreateTodoItemRequest(BaseModel):
    description: str
    due_date: Optional[str] = None


class UpdateTodoItemRequest(BaseModel):
    completed: Optional[bool] = None
    description: Optional[str] = None
    due_date: Optional[str] = None


class CreateTodoListRequest(BaseModel):
    name: str
    description: Optional[str] = None


class CloneTodoListRequest(BaseModel):
    name: str

class ShareTodoListRequest(BaseModel):
    user_ids: list[int]
    role_id: int
