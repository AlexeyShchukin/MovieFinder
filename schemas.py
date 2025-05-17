from pydantic import BaseModel

class LogQueryRequest(BaseModel):
    title: str | None = None
    genre: str | None = None
    actor: str | None = None
    year: int | None = None