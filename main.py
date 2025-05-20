from typing import Any, Annotated

from fastapi import FastAPI, Query, Request, Depends
from uvicorn import run
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from mysql.connector.errors import DatabaseError, Error

from handlers import handle_db_error, handle_mysql_error, handle_unexpected_error
from middleware import logging_middleware
from schemas import LogQueryRequest, FieldEnum
from unit_of_work import UnitOfWork

app = FastAPI()

app.middleware("http")(logging_middleware)
app.add_exception_handler(DatabaseError, handle_db_error)
app.add_exception_handler(Error, handle_mysql_error)
app.add_exception_handler(Exception, handle_unexpected_error)

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")


@app.get("/", response_class=HTMLResponse)
async def read_index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/log_query")
async def log_query(
        data: LogQueryRequest,
        uow: Annotated[UnitOfWork, Depends(UnitOfWork)]
):
    with uow:
        uow.films.log_query(data.title, data.genre, data.actor, data.year)
        return {"status": "logged"}


@app.get("/movies")
def get_movies(
        uow: Annotated[UnitOfWork, Depends(UnitOfWork)],
        title: Annotated[str | None, Query()] = None,
        genre: Annotated[str | None, Query()] = None,
        actor: Annotated[str | None, Query()] = None,
        year: Annotated[int | None, Query()] = None,
        page: Annotated[int, Query(ge=1)] = 1
) -> list[dict[str, Any]]:
    with uow:
        films = uow.films.get_filtered(page, title, genre, actor, year)
        return films


@app.get("/autocomplete")
def autocomplete(
        uow: Annotated[UnitOfWork, Depends(UnitOfWork)],
        field: Annotated[FieldEnum, Query(...)],
        query: Annotated[str, Query()] = ''
):
    with uow:
        return uow.films.autocomplete(field, query)


@app.get("/popular_queries")
def get_popular_queries(
        uow: Annotated[UnitOfWork, Depends(UnitOfWork)],
        limit: int = 10
) -> list[dict[str, Any]]:
    with uow:
        return uow.films.get_top_queries(limit)


if __name__ == "__main__":
    run(
        "main:app",
        host="127.0.0.1",
        port=8000
    )
