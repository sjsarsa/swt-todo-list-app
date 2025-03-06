from typing import List
from sqlalchemy import select, text
from http import HTTPStatus
from fastapi import HTTPException

from core.base_service import BaseService
from model.user import User
from core.database import database


@database.transaction()
async def find_users(
    id: int | None = None,
    username: str | None = None,
    query_string: str | None = None,
    limit: int | None = None,
) -> List[User]:
    sql = """
    SELECT * 
    FROM users
    WHERE (id = :id OR :id IS NULL)
      AND (username = :username OR :username IS NULL)
      AND (username ILIKE '%' || :query || '%' OR :query IS NULL)
    """
    if limit:
        sql = sql + "\nLIMIT :limit\n"
    
    query = text(sql).bindparams(id=id, username=username, query=query_string)
    query = select(User).from_statement(query)

    rows = await database.fetch_all(query=query)
    return database.map_to_models(rows, User)


@database.transaction()
async def create_user(username: str, password: str) -> User:
    sql = """
    INSERT INTO users (username, password)
    VALUES (:username, :password)
    RETURNING *
    """
    user = await find_user(username=username)

    if user:
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST,
                            detail="User already exists with this username")

    query = text(sql).bindparams(username=username, password=password)
    user = await database.fetch_one(query=query)
    if user is None:
        raise HTTPException(
            status_code=500, detail="Failed to create user")
    return database.map_to_model(user, User)


@database.transaction()
async def find_user(
    id: int | None = None,
    username: str | None = None,
) -> User | None:
    users = await find_users(id, username, limit=1)
    return users[0] if users else None


class UserService(BaseService):

    def __init__(self):
        super().__init__(User)

    @database.transaction()
    async def find_users(
        self,
        id: int | None = None,
        username: str | None = None,
        limit: int | None = None,
    ) -> List[User]:
        sql = """
        SELECT * 
        FROM users
        WHERE (id = :id OR :id IS NULL)
          AND (username = :username OR :username IS NULL)
        """
        if limit:
            query = text(sql + "\nLIMIT :limit\n").bindparams(id=id,
                                                              username=username, limit=limit)
        else:
            query = text(sql).bindparams(id=id, username=username)

        query = select(User).from_statement(query)
        return await super().fetch_all(query=query)

    @database.transaction()
    async def create_user(self, username: str, password: str) -> User:
        user = await find_user(username=username)

        if user:
            raise HTTPException(status_code=HTTPStatus.BAD_REQUEST,
                                detail="User already exists with this username")

        sql = """
        INSERT INTO users (username, password)
        VALUES (:username, :password)
        RETURNING *
        """
        query = text(sql).bindparams(username=username, password=password)
        user = await database.fetch_one(query=query)
        if user is None:
            raise HTTPException(
                status_code=500, detail="Failed to create user")
        return database.map_to_model(user, User)

    @database.transaction()
    async def get_user(self, id: int) -> User | None:
        users = await self.find_users(id, limit=1)
        return users[0] if users else None
