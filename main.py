from fastapi import FastAPI, Query, Request
from uvicorn import run
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse

from unit_of_work import UnitOfWork

app = FastAPI()

@app.get("/movies")
def get_movies(
        genre: str | None = Query(None),
        actor: str | None = Query(None),
        year: int | None = Query(None),
        page: int = Query(1, ge=1)
):
    with UnitOfWork() as uow:
        films = uow.films.get_filtered(page, genre, actor, year)
        return films


app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def read_index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


if __name__ == "__main__":
    run(
        "main:app",
        host="127.0.0.1",
        port=8000
    )