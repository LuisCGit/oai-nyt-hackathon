"""
API Config:
Automatically loads environment variables
"""

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()


class APISettings(BaseSettings):
    """
    API Config
    """

    # dev, prod
    ENVIRONMENT: str | None = None

    # Cluster urls
    BASE_API_URL: str | None = None
    BASE_CLIENT_URL: str | None = None

    # Supabase config
    SUPABASE_PROJECT_URL: str | None = None
    SUPABASE_API_KEY: str | None = None

    # OpenAI config
    OPENAI_API_KEY: str | None = None

    # Shopify
    # SHOPIFY_CLIENT_SECRET: str | None = None
    # SHOPIFY_CLIENT_ID: str | None = None
    # SHOPIFY_API_VERSION: str | None = None
    # SHOPIFY_STOREFRONT_API_VERSION: str | None = None

    # Langchain
    LANGSMITH_TRACING: bool | None = None
    LANGSMITH_ENDPOINT: str | None = None
    LANGSMITH_API_KEY: str | None = None
    LANGSMITH_PROJECT: str | None = None


settings = APISettings()
