from pydantic import BaseModel
from datetime import datetime

from model.todo_list_role import TodoListRole
from model.user import User
from model.role import Role


class UserDto(BaseModel):
    id: int
    username: str

    @staticmethod
    def from_user(user: User):
        return UserDto(id=user.id, username=user.username)


class TodoListRoleDto(BaseModel):
    id: int
    name: str

    @staticmethod
    def from_todo_list_role(todo_list_role: TodoListRole):
        return TodoListRoleDto(id=todo_list_role.id, name=todo_list_role.name)


class TodoListMemberDto(BaseModel):
    user: UserDto
    role: TodoListRoleDto

    @staticmethod
    def from_user_and_role_dtos(user: UserDto, role: TodoListRoleDto):
        return TodoListMemberDto(user=user, role=role)


class TodoListDto(BaseModel):
    id: int
    name: str
    description: str | None
    author: UserDto
    role: Role
    created: datetime
    updated: datetime

    @staticmethod
    def from_raw(id: int, name: str, description: str | None, author_id: int, author_username: str, role: Role, created: datetime, updated: datetime):
        return TodoListDto(
            id=id,
            name=name,
            description=description,
            author=UserDto(id=author_id, username=author_username),
            role=role,
            created=created,
            updated=updated
        )
