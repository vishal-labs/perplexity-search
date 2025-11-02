from perplexity import Perplexity
import os
from fastapi import FastAPI
from fastapi import FastAPI, Form, Request
from fastapi.responses import HTMLResponse
from dotenv import load_dotenv
from fastapi.templating import Jinja2Templates

load_dotenv()
app = FastAPI()
client = Perplexity()
templates = Jinja2Templates(directory="templates")


def ppxtly_search(Query):
    search = client.search.create(
        query=Query,
        max_results=1,
        max_tokens_per_page=1024
    )
    for result in search.results:
        print(result.url)
    return result.url

@app.get("/", response_class=HTMLResponse)
async def get_form(request: Request):
    return templates.TemplateResponse("index-page.html", {"request": request})


@app.post("/", response_class=HTMLResponse)
async def handle_input(request: Request, user_input: str = Form(...)):
    search = ppxtly_search(Query=user_input)
    return templates.TemplateResponse(
        "response.html",
        {"request": request, "search": search}
        )
