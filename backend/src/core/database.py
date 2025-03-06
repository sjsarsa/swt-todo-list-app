from core.database_wrapper import DatabaseWrapper
import os

database_url = os.getenv('DATABASE_URL')

# abort if the database_url is not set
if database_url is None:
    raise ValueError(
        "database_url is not set. Please provide a database_url either as an argument or in the environment variable DATABASE_URL.")

database_url = database_url.replace(
    "postgresql://", "postgresql+asyncpg://")

database = DatabaseWrapper(database_url)
