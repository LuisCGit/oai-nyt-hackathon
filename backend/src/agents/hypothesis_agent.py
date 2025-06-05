import os
import asyncio
import random
from openai.types.responses import ResponseTextDeltaEvent

from agents import Agent, Runner, function_tool

from src.config import settings

os.environ["OPENAI_API_KEY"] = settings.OPENAI_API_KEY


@function_tool
def generate_random_number():
    return random.randint(1, 3)


async def create_agent_stream(user_input: str):
    agent = Agent(
        name="Hypothesis Agent",
        instructions="You are a helpful assistant that specializes in generating and analyzing hypotheses.",
        tools=[generate_random_number],
    )

    result = Runner.run_streamed(agent, input=user_input)
    async for event in result.stream_events():
        if event.type == "raw_response_event" and isinstance(event.data, ResponseTextDeltaEvent):
            yield event.data.delta


async def main():
    agent = Agent(
        name="Joker",
        instructions="You are a helpful assistant.",
        tools=[generate_random_number],
    )

    result = Runner.run_streamed(agent, input="Please tell me 5 jokes. and then generate a  random number")
    async for event in result.stream_events():
        if event.type == "raw_response_event" and isinstance(event.data, ResponseTextDeltaEvent):
            print(event.data.delta, end="", flush=True)
        else:
            print(event.type)


if __name__ == "__main__":
    asyncio.run(main())
