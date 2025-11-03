#importing modules
from perplexity import Perplexity
import json
import os
from fastapi import FastAPI
from fastapi import FastAPI, Form, Request
from fastapi.responses import HTMLResponse
from dotenv import load_dotenv
from fastapi.templating import Jinja2Templates
import mysql.connector
from mysql.connector import errorcode


#creating the class instances
load_dotenv()
app = FastAPI()
client = Perplexity()
templates = Jinja2Templates(directory="templates")

#logging into a created database
db_user = os.getenv("DB_USERNAME")
db_user_pass = os.getenv("DB_PASS")
db_name = os.getenv("DB_NAME")
try:
    conn = mysql.connector.connect(
    host="127.0.0.1",
    user=db_user,
    password=db_user_pass,
    database=db_name
    )
    if conn.is_connected():
       print("connection to the DB is successfull")

except mysql.connector.Error as err:
  if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
    print("Something is wrong with your user name or password")
  elif err.errno == errorcode.ER_BAD_DB_ERROR:
    print("Database does not exist")
  else:
    print(err)

cursor = conn.cursor()
try:
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS queryinfo(
        id INT AUTO_INCREMENT PRIMARY KEY,
        query TEXT,
        result TEXT DEFAULT NULL
                )
    """)
    print("table: queryinfo is created ")

except mysql.connector.Error as err:
   print(f"There was some error, creating database {err}")

#creating a function that takes in the query for the perplexity search API and returns a result. 
def ppxtly_search(Query):

    search = client.search.create(
        query=Query,
        max_results=2,
        max_tokens_per_page=1024
    )
    for results in search.results:
        print(results.url)

    url_string = ""
    for item in search.results:
       url_sring = url_string + item.url + " \n"
    url_string = {"urls": url_string}
    #insertion of query along with the results into the table
    insert_query = """
        INSERT INTO queryinfo (query, result)
        VALUES (%s, %s)
        """
    inserting_values = (Query, url_sring)
    
    cursor.execute(insert_query, inserting_values)
    #print(search.results)
    conn.commit()

    return results

@app.get("/", response_class=HTMLResponse)
async def get_form(request: Request):
    return templates.TemplateResponse("index-page.html", {"request": request})


@app.post("/", response_class=HTMLResponse)
async def handle_input(request: Request, user_input: str = Form(...)):
    results = ppxtly_search(Query=user_input) #this function returns the 
    search = results.url
    snippet = results.snippet
    return templates.TemplateResponse(
        "response.html",
        {"request": request, "search": search, "snippet": snippet}
        )


@app.get("/getdb")
def printdata():
    cursor.execute("""SELECT * from queryinfo;""")
    rows = cursor.fetchall()
    for row in rows:
       print(row)
    return {"data": rows}
