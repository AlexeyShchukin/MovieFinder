from pydantic import BaseModel

class LogQueryRequest(BaseModel):
    genre: str | None = None
    actor: str | None = None
    year: int | None = None