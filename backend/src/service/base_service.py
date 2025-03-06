from core.database_wrapper import DatabaseWrapper
import functools


def transaction(database: DatabaseWrapper | None):
    def decorator(f):
        @functools.wraps(f)
        async def wrapper(*args, **kwargs):
            assert database is not None, "Database is not initialized"

            async with database.transaction():
                return await f(*args, **kwargs)
        return wrapper
    return decorator


class BaseService:
    database: DatabaseWrapper | None = None

    def __init__(self, database: DatabaseWrapper):
        self.database = database

    @transaction(database)
    def create(self, *args, **kwargs):
        pass
