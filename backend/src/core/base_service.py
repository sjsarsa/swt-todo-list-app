from typing import Any, Generic, Type, TypeVar

from sqlalchemy import ClauseElement, insert, select, update, delete
from sqlmodel import SQLModel

from core.database import database

ModelType = TypeVar("ModelType", bound=SQLModel)


class BaseService(Generic[ModelType]):
    """Base class for data repositories."""

    def __init__(self, model_class: Type[ModelType]):
        self.model_class: Type[ModelType] = model_class

    async def fetch_all(
        self,
        query: ClauseElement | str,
    ) -> list[ModelType]:
        """
        Returns a list of model instances.
        :return: A list of model instances.
        """
        rows = await database.fetch_all(query=query, model=self.model_class)
        return [self.model_class(**row) for row in rows]

    async def fetch_one(
        self,
        query: ClauseElement | str,
    ) -> ModelType | None:
        """
        Returns a single model instance.
        :param id: The primary key of the model instance.
        :return: A single model instance.
        """
        row = await database.fetch_one(query=query, model=self.model_class)
        return self.model_class(**row) if row else None

    async def find(
        self,
        params: dict[str, Any]
    ) -> list[ModelType]:
        """
        Returns a list of model instances.
        :param params: The parameters to filter by.
        :return: A list of model instances.
        """
        query = select(self.model_class).filter_by(**params)
        return await self.fetch_all(query=query)

    async def find_one(
        self,
        params: dict[str, Any]
    ) -> ModelType | None:
        """
        Returns a single model instance.
        :param params: The parameters to filter by.
        :return: A single model instance.
        """
        query = select(self.model_class).filter_by(**params)
        return await self.fetch_one(query=query)

    async def create(
        self,
        attributes: dict[str, Any]
    ) -> ModelType:
        """
        Creates a new model instance.
        :param model: The model instance to create.
        :return: The created model instance.
        """
        query = insert(self.model_class).values(**attributes)
        row = await database.fetch_one(query=query, model=self.model_class)
        return self.model_class(**row)

    async def update(
        self,
        id: int,
        attributes: dict[str, Any]
    ) -> ModelType:
        """
        Updates an existing model instance.
        :param id: The primary key of the model instance.
        :param attributes: The attributes to update.
        :return: The updated model instance.
        """
        query = (
            update(self.model_class)
            .where(self.model_class.id == id)
            .values(**attributes)
            .returning(self.model_class)
        )
        row = await database.fetch_one(query=query, model=self.model_class)
        return self.model_class(**row)

    async def delete(
        self,
        id: int
    ) -> None:
        """
        Deletes an existing model instance.
        :param id: The primary key of the model instance.
        """
        query = delete(self.model_class).where(self.model_class.id == id)
        await database.execute(query=query)
