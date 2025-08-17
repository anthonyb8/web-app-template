# app/database.py
import aiomysql
from aiomysql import Pool
from contextlib import asynccontextmanager
from app.config import settings


class Database:
    def __init__(self):
        self.pool: Pool

    async def connect(self):
        self.pool = await aiomysql.create_pool(
            host=settings.host,
            user=settings.user,
            password=settings.password,
            db=settings.db,
            minsize=5,
            maxsize=20,
            autocommit=True,  # Updates across pool
        )

    async def disconnect(self):
        if self.pool:
            self.pool.close()
            await self.pool.wait_closed()

    @asynccontextmanager
    async def get_connection(self):
        async with self.pool.acquire() as conn:
            try:
                yield conn
            except Exception:
                await conn.rollback()
                raise


database = Database()
