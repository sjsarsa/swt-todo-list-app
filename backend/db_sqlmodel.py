from sqlalchemy.orm import session, sessionmaker
from sqlalchemy.ext.asyncio import async_session, create_async_engine
from sqlalchemy.ext.asyncio.session import AsyncSession
import os


user = os.getenv('POSTGRES_USER')
password = os.getenv('POSTGRES_PASSWORD')
host = 'db'
port = '5432'
database = os.getenv('POSTGRES_DB')

database_url = f"postgresql+asyncpg://{user}:{password}@{host}:{port}/{database}"

engine = create_async_engine(database_url, echo=True, future=True)

async def get_async_session() -> AsyncSession:
    async_session = sessionmaker(
        bind=engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as session:
        yield session

database = get_async_session()
