from psycopg_pool import AsyncConnectionPool
from psycopg.rows import dict_row, class_row
from typing import Any, List
import os


class Database:
    def __init__(self):
        self.user = os.getenv('POSTGRES_USER')
        self.password = os.getenv('POSTGRES_PASSWORD')
        self.host = 'db'
        self.port = '5432'
        self.database = os.getenv('POSTGRES_DB')

    async def connect(self):
        conn_str = f"""
            dbname={self.database}
            user={self.user}
            password={self.password}
            host={self.host}
            port={self.port}
        """
        try:
            self._pool = AsyncConnectionPool(
                conn_str, open=True, kwargs={"row_factory": dict_row})
            print("connected to database", self.database)
        except Exception as e:
            print(e)

    async def execute(self, *args, map_to_model: Any | None=None, **kwargs) -> List[Any]:
        """
        Function to fetch rows from the database
        """
        async with self._pool.connection() as conn:
            if map_to_model:
                row_factory = class_row(map_to_model)
            else :
                row_factory = dict_row

            async with conn.cursor(row_factory=row_factory) as cur:
                await cur.execute(*args, **kwargs)
                return await cur.fetchall()

    async def close(self):
        await self._pool.close()


database = Database()
