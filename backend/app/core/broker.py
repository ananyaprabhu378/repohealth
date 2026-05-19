import asyncio
from typing import Dict, Set
import logging

logger = logging.getLogger("aethergraph")

class MemoryBroker:
    def __init__(self):
        self.subscribers: Dict[str, Set[asyncio.Queue]] = {}
        self.progress_store: Dict[str, str] = {}

    def subscribe(self, channel: str) -> asyncio.Queue:
        queue = asyncio.Queue()
        if channel not in self.subscribers:
            self.subscribers[channel] = set()
        self.subscribers[channel].add(queue)
        logger.debug(f"MemoryBroker: Subscribed to channel '{channel}'")
        return queue

    def unsubscribe(self, channel: str, queue: asyncio.Queue):
        if channel in self.subscribers:
            self.subscribers[channel].discard(queue)
            if not self.subscribers[channel]:
                del self.subscribers[channel]
            logger.debug(f"MemoryBroker: Unsubscribed from channel '{channel}'")

    def publish(self, channel: str, data: str):
        if channel in self.subscribers:
            logger.debug(f"MemoryBroker: Publishing to '{channel}' with {len(self.subscribers[channel])} subscriber(s)")
            for queue in self.subscribers[channel]:
                queue.put_nowait(data)

    def set_progress(self, repo_id: str, data: str):
        self.progress_store[repo_id] = data

    def get_progress(self, repo_id: str) -> str:
        return self.progress_store.get(repo_id)

memory_broker = MemoryBroker()
