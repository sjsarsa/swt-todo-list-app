from databases import Database
from databases.interfaces import Record
from fastapi import HTTPException
from pydantic import BaseModel
from sqlalchemy import ClauseElement, Compiled

from typing import Type, TypeVar
from logging import getLogger

from sqlmodel import SQLModel

logger = getLogger("app.db.execute")


class DatabaseWrapper(Database):
    def __init__(self, database_url: str):
        super().__init__(database_url)
        self.database_url = database_url

    def print_query(self,
                    query: ClauseElement | str | Compiled,
                    values: list | dict | None = None,
                    model: SQLModel | None = None):
        if isinstance(query, ClauseElement):
            query = query.compile(compile_kwargs={"literal_binds": True})
            logger.info(f"{query}")
        else:
            logger.info(f"{query}")
        if values is not None:
            logger.info(f"parameters: {values}")

    async def connect(self):
        await super().connect()

    async def disconnect(self):
        await super().disconnect()

    async def fetch_all(self,
                        query: ClauseElement | str,
                        values: dict | None = None
                        ) -> list[Record]:
        self.print_query(query, values)
        try:
            return await super().fetch_all(query, values)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def fetch_one(self,
                        query: ClauseElement | str,
                        values: dict | None = None,
                        ) -> Record | None:
        self.print_query(query, values)
        try:
            return await super().fetch_one(query, values)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def execute(self,
                      query: ClauseElement | str,
                      values: dict | None = None):
        self.print_query(query, values, None)
        try:
            return await super().execute(query, values)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def execute_many(self,
                           query: ClauseElement | str,
                           values: list) -> None:
        self.print_query(query, values, None)
        try:
            return await super().execute_many(query, values)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    ModelType = TypeVar("ModelType", bound=BaseModel)

    @staticmethod
    def map_to_model(row: Record, model: Type[ModelType]) -> ModelType:
        return model(**row)  # type: ignore

    @staticmethod
    def map_to_models(rows: list[Record], model: Type[ModelType]) -> list[ModelType]:
        return [model(**row) for row in rows]  # type: ignore
