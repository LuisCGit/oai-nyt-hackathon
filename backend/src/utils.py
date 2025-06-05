# Utility functions

import collections
from datetime import datetime, timedelta
from decimal import Decimal
from dotenv import load_dotenv
import os
from typing import Any
import httpx
import json

from fastapi import HTTPException

load_dotenv()
LOOKBACK_DAYS = 30


class ShopifyService:
    def __init__(self):
        self.api_version = os.getenv("SHOPIFY_API_VERSION")
        # self.store_url = "just-us-skin-care.myshopify.com"
        self.store_url = "extra-base-sports.myshopify.com"
        self.access_token = os.getenv("SHOPIFY_ACCESS_TOKEN")

    async def make_graphql_request(
        self,
        query: str,
        api_type: str = "admin",
        variables: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Make a GraphQL request to Shopify Admin or Storefront API.

        Args:
            org_id: The organization ID
            db: Database client
            query: The GraphQL query string
            api_type: The API to use - either "admin" or "storefront"
            variables: Optional variables for the query

        Returns:
            The JSON response from Shopify

        Raises:
            ValueError: If api_type is not "admin" or "storefront"
        """
        if api_type not in ["admin", "storefront"]:
            raise ValueError('api_type must be either "admin" or "storefront"')

        shop, access_token = self.store_url, self.access_token

        # Different URL and header based on API type
        if api_type == "admin":
            url = f"https://{shop}/admin/api/{self.api_version}/graphql.json"
            headers = {"Content-Type": "application/json", "X-Shopify-Access-Token": access_token}
        else:  # storefront
            url = f"https://{shop}/api/{self.api_version}/graphql.json"
            headers = {"Content-Type": "application/json", "Shopify-Storefront-Private-Token": access_token}

        payload = {"query": query, "variables": variables or {}}

        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, content=json.dumps(payload))

            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code, detail=f"Shopify API request failed: {response.text}"
                )

            data = response.json()

            if "errors" in data:
                raise HTTPException(status_code=400, detail=f"GraphQL query failed: {data['errors']}")

            return data

    async def fetch_30d_sales(self) -> dict[str, Any]:
        """Return {product_gid: {'units': int, 'sales': Decimal}}."""
        since = (datetime.utcnow() - timedelta(days=LOOKBACK_DAYS)).replace(microsecond=0).isoformat() + "Z"

        base_query = """
        query($after: String) {{
        orders(first: 250, query: "processed_at:>={since}", after: $after) {{
            pageInfo {{ hasNextPage }}
            edges {{
            cursor
            node {{
                lineItems(first: 100) {{
                edges {{
                    node {{
                    quantity
                    originalTotalSet {{ shopMoney {{ amount }} }}
                    product {{ id }}
                    }}
                }}
                }}
            }}
            }}
        }}
        }}"""
        query = base_query.format(since=since)
        variables = {}

        # YOUR existing async helper
        first_page = await ShopifyService().make_graphql_request(query=query, variables=variables, api_type="admin")

        # Simple aggregator
        totals = collections.defaultdict(lambda: {"units": 0, "sales": Decimal("0")})

        def consume(page):
            for edge in page["data"]["orders"]["edges"]:
                for li in edge["node"]["lineItems"]["edges"]:
                    node = li["node"]
                    if node["product"] is None:
                        continue
                    gid = node["product"]["id"]
                    totals[gid]["units"] += int(node["quantity"])
                    totals[gid]["sales"] += Decimal(node["originalTotalSet"]["shopMoney"]["amount"])

        consume(first_page)

        # follow pagination if needed
        while first_page["data"]["orders"]["pageInfo"]["hasNextPage"]:
            cursor = first_page["data"]["orders"]["edges"][-1]["cursor"]
            next_page = await ShopifyService().make_graphql_request(
                query=query,
                variables={"after": cursor},
                api_type="admin",
            )
            consume(next_page)
            first_page = next_page

        # cast Decimals to float for JSON
        return {gid: {"unitsSold30d": v["units"], "grossSales30d": float(v["sales"])} for gid, v in totals.items()}

    async def calculate_aov(self) -> float:
        """Calculate Average Order Value over the last 30 days."""
        since = (datetime.utcnow() - timedelta(days=LOOKBACK_DAYS)).replace(microsecond=0).isoformat() + "Z"

        query = (
            """
        query($after: String) {
        orders(first: 250, query: "processed_at:>=%s", after: $after) {
            pageInfo { hasNextPage }
            edges {
            cursor
            node {
                totalPriceSet { shopMoney { amount } }
            }
            }
        }
        }"""
            % since
        )

        variables = {}
        first_page = await ShopifyService().make_graphql_request(query=query, variables=variables, api_type="admin")

        total_revenue = Decimal("0")
        total_orders = 0

        def consume(page):
            nonlocal total_revenue, total_orders
            for edge in page["data"]["orders"]["edges"]:
                total_revenue += Decimal(edge["node"]["totalPriceSet"]["shopMoney"]["amount"])
                total_orders += 1

        consume(first_page)

        # follow pagination if needed
        while first_page["data"]["orders"]["pageInfo"]["hasNextPage"]:
            cursor = first_page["data"]["orders"]["edges"][-1]["cursor"]
            next_page = await ShopifyService().make_graphql_request(
                query=query,
                variables={"after": cursor},
                api_type="admin",
            )
            consume(next_page)
            first_page = next_page

        if total_orders == 0:
            return 0.0

        return float(total_revenue / total_orders)
