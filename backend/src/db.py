from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from typing import Any, Callable

from dotenv import load_dotenv
import os

load_dotenv()

from supabase import create_client, Client
from supabase._async.client import create_client as create_client_async
from supabase._async.client import AsyncClient
from uuid import UUID


class BackgroundTaskManager:
    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=5)

    def submit_task(self, func: Callable, *args: Any, **kwargs: Any):
        """Submit a task to be executed in the background with error handling."""
        future = self.executor.submit(func, *args, **kwargs)
        future.add_done_callback(self._handle_task_result)
        return future

    def _handle_task_result(self, future):
        """Callback to handle task completion and log any errors."""
        try:
            future.result()  # This will raise the exception if one occurred
        except Exception as e:
            print(f"Background task failed: {str(e)}")


class SupabaseClient:
    def __init__(self):
        self.client: Client = create_client(os.getenv("SUPABASE_PROJECT_URL"), os.getenv("SUPABASE_API_KEY"))
        self.background_task_manager = BackgroundTaskManager()

    def insert(self, table: str, data: dict | list[dict]):
        try:
            response = self.client.table(table).insert(data).execute()
            return response.data
        except Exception as e:
            print("Error Inserting: ", e)
            raise e

    def select(
        self,
        table: str,
        columns: str = "*",
        conditions: dict = None,
        order: str = None,
        desc: bool = True,
        limit: int = None,
    ):
        try:
            query = self.client.table(table).select(columns)
            if conditions:
                for key, value in conditions.items():
                    if key.endswith(" ILIKE"):
                        column_name = key[:-6]
                        query = query.ilike(column_name, value)
                    elif key.endswith(" NEQ"):
                        column_name = key[:-4]
                        query = query.neq(column_name, value)
                    elif key.endswith(" IS NULL"):
                        column_name = key[:-8]
                        query = query.is_(column_name, "null")
                    elif isinstance(value, list):
                        query = query.in_(key, value)
                    else:
                        query = query.eq(key, value)
            if order:
                query = query.order(order, desc=desc)
            if limit:
                query = query.limit(limit)
            response = query.execute()
            return response.data
        except Exception as e:
            print("Error Selecting: ", e)
            raise e

    def update(self, table: str, conditions: dict, data: dict):
        try:
            # Convert UUID fields in data to strings
            for key, value in data.items():
                if isinstance(value, UUID):
                    data[key] = str(value)
            query = self.client.table(table).update(data)
            for key, value in conditions.items():
                if isinstance(value, list):
                    query = query.in_(key, value)
                else:
                    query = query.eq(key, value)
            response = query.execute()
            return response.data
        except Exception as e:
            print("Error Updating: ", e)
            raise e

    def delete(self, table: str, conditions: dict):
        try:
            query = self.client.table(table).delete()
            for key, value in conditions.items():
                if key.endswith(" ILIKE"):
                    column_name = key[:-6]
                    query = query.ilike(column_name, value)
                elif key.endswith(" NEQ"):
                    column_name = key[:-4]
                    query = query.neq(column_name, value)
                elif key.endswith(" IS NULL"):
                    column_name = key[:-8]
                    query = query.is_(column_name, "null")
                elif isinstance(value, list):
                    query = query.in_(key, value)
                else:
                    query = query.eq(key, value)
            response = query.execute()
            return response.data
        except Exception as e:
            print("Error Deleting: ", e)
            raise e

    def upsert(
        self, table: str, data: dict | list[dict], on_conflict: str | None = None, ignore_on_update: list[str] = None
    ):
        if ignore_on_update:
            data = [{k: v for k, v in d.items() if k not in ignore_on_update} for d in data]
        try:
            response = self.client.table(table).upsert(data, on_conflict=on_conflict).execute()
            return response.data
        except Exception as e:
            print("Error Upserting: ", e)
            raise e

    def call_function(self, function_name: str, params: dict = None):
        """
        This is used to call supabase functions.
        Supabase Functions define SQL that is defined and executed at the pg layer
        Access here: https://supabase.com/dashboard/project/jbjqzrqecuqaktdnkbsp/database/functions

        """
        try:
            response = self.client.rpc(function_name, params).execute()
            return response.data
        except Exception as e:
            print(f"Error calling function {function_name}: ", e)
            raise e

    def custom_upsert(self, table: str, data: dict, conditions: dict, ignore_on_update: list[str] = None):
        """
        Custom upsert method that updates if a single record exists, inserts if none exist,
        and raises an exception if more than one record exists.

        Args:
            table (str): The name of the table.
            data (dict): The data to upsert.
            conditions (dict): The conditions to check for existing records.
            ignore_on_update (list[str], optional): List of keys to ignore in data when updating.

        Returns:
            list: The upserted record(s).
        """
        try:
            # Convert datetime objects to ISO format strings
            if isinstance(data, dict):
                for key, value in data.items():
                    if isinstance(value, datetime):
                        data[key] = value.isoformat()
            existing_records = self.select(table, conditions=conditions)
            if len(existing_records) == 1:
                if ignore_on_update:
                    data = {k: v for k, v in data.items() if k not in ignore_on_update}
                # Update the existing record
                updated_record = self.update(table, conditions=conditions, data=data)
                return updated_record
            elif len(existing_records) == 0:
                # Insert a new record
                inserted_record = self.insert(table, data)
                return inserted_record
            else:
                raise Exception(f"Multiple records found for conditions: {conditions}")
        except Exception as e:
            print(f"Error in custom upsert for {table}: ", e)
            raise e

    def update_background(self, table: str, conditions: dict, data: dict):
        """Submit an update to run in the background with logging."""
        try:
            return self.background_task_manager.submit_task(self.update, table, conditions, data)
        except Exception as e:
            print(f"Failed to submit background task: {str(e)}")
            raise


class AsyncSupabaseClient:

    def __init__(self):
        self.client: AsyncClient | None = None

    async def initialize(self):
        """Initialize the async client. Must be called before using."""
        if self.client is None:
            self.client = await create_client_async(os.getenv("SUPABASE_PROJECT_URL"), os.getenv("SUPABASE_API_KEY"))

    async def aselect(
        self,
        table: str,
        columns: str = "*",
        conditions: dict = None,
        order: str = None,
        desc: bool = True,
        limit: int = None,
    ):
        try:
            query = self.client.table(table).select(columns)
            if conditions:
                for key, value in conditions.items():
                    if key.endswith(" ILIKE"):
                        column_name = key[:-6]
                        query = query.ilike(column_name, value)
                    elif key.endswith(" NEQ"):
                        column_name = key[:-4]
                        query = query.neq(column_name, value)
                    elif key.endswith(" IS NULL"):
                        column_name = key[:-8]
                        query = query.is_(column_name, "null")
                    elif isinstance(value, list):
                        query = query.in_(key, value)
                    else:
                        query = query.eq(key, value)
            if order:
                query = query.order(order, desc=desc)
            if limit:
                query = query.limit(limit)
            response = await query.execute()
            return response.data
        except Exception as e:
            print("Error Selecting: ", e)
            raise e

    async def acall_function(self, function_name: str, params: dict = None):
        try:
            response = await self.client.rpc(function_name, params).execute()
            return response.data
        except Exception as e:
            print(f"Error calling function {function_name}: ", e)
            raise e

    async def ainsert(self, table: str, data: dict | list[dict]):
        try:
            response = await self.client.table(table).insert(data).execute()
            return response.data
        except Exception as e:
            print("Error Inserting: ", e)
            raise e
