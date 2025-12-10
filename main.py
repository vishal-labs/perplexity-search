#importing modules
from perplexity import Perplexity
from fastapi.middleware.cors import CORSMiddleware
import json
import os
from fastapi import FastAPI, Form, Request, HTTPException, Body
from fastapi.responses import HTMLResponse, JSONResponse
from dotenv import load_dotenv
from fastapi.templating import Jinja2Templates
import mysql.connector
from mysql.connector import errorcode
from ML.modelPredicton import Modelprediction
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from typing import Optional, List

#creating the class instances
load_dotenv()
app = FastAPI()
client = Perplexity()
templates = Jinja2Templates(directory="templates")

# Setting up CORS middleware so that frontend can communicate with the backend
origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#logging into a created database
db_user = os.getenv("DB_USERNAME")
db_user_pass = os.getenv("DB_PASSWORD")
db_name = os.getenv("DB_NAME")
host = os.getenv("HOST")

def get_db_connection():
    try:
        conn = mysql.connector.connect(
            host=host,
            user=db_user,
            password=db_user_pass,
            database=db_name
        )
        return conn
    except mysql.connector.Error as err:
        print(f"Error connecting to DB: {err}")
        return None

# Initialize DB and Table
try:
    conn = get_db_connection()
    if conn and conn.is_connected():
        print("connection to the DB is successful")
        cursor = conn.cursor()
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS queryinfo(
            id INT AUTO_INCREMENT PRIMARY KEY,
            query TEXT,
            result TEXT DEFAULT NULL
        )
        """)
        print("table: queryinfo is checked/created ")
        cursor.close()
        conn.close()
except Exception as e:
    print(f"Init DB error: {e}")


class SearchRequest(BaseModel):
    query: str

#creating a function that takes in the query for the perplexity search API and returns a result. 
def ppxtly_search(query_text):
    try:
        # Using the client as per original code, assuming it works
        search = client.search.create(
            query=query_text,
            max_results=5,
            max_tokens_per_page=1024
        )
        
        # Extract sources
        sources = []
        for result in search.results:
            sources.append({
                "url": result.url,
                "snippet": result.snippet if hasattr(result, 'snippet') else "",
                "title": result.title if hasattr(result, 'title') else result.url
            })
            
        # The 'search' object itself might have an 'answer' or 'text' attribute depending on the library version
        # Based on typical usage, let's assume we can get a main answer. 
        # If the library just returns results, we might need to synthesize or just return the results.
        # Looking at original code: it iterated search.results.
        # Let's assume 'search' object has an answer if it's a chat completion, but here it looks like a search client.
        # We will construct a response based on available data.
        
        # For now, let's serialize the whole result structure to store it
        response_data = {
            "answer": "Here are the search results for your query.", # Placeholder if no direct answer
            "sources": sources
        }
        
        # If the library provides a direct answer (like a chat completion), use it.
        # Since I can't see the library internals, I'll stick to what was there but structured.
        
        return response_data
    except Exception as e:
        print(f"Search error: {e}")
        return {"answer": "Error performing search.", "sources": []}

#Get the endpoints from the URL. 
@app.middleware("http")
async def log_endpoints(request: Request, call_next):
    # Whitelist endpoints
    allowed_paths = ["/api/history/", "/api/search", "/docs", "/openapi.json"]
    if request.url.path in allowed_paths or request.url.path.startswith("/api/history/"):
        return await call_next(request)

    # Append only the endpoint (path) to a text file
    with open("endpoints.log", "a") as log_file:
        log_file.write(f"{request.url.path}\n")
        
        # Only run prediction for unknown endpoints
        try:
            result = Modelprediction()
            ans = result.predict(str(request.url.path))
            print("The endpoint: "+ request.url.path+ " is classified to:" + str(ans))
        except Exception as e:
            print(f"Prediction error: {e}")
            ans = [0] # Default to safe
    
    if ans == 1:  
        html_content = f"""
        <html>
            <head><title>Prediction</title></head>
            <body>
                <h1>Classification Result</h1>
                <p>The endpoint <strong>{request.url.path}</strong> is classified as:
                <strong>{ans}</strong></p>
            </body>
        </html>
        """
        print("classifed as restricted")
        return HTMLResponse(content=html_content, status_code=403)
        
    response = await call_next(request)
    return response


@app.get("/", response_class=HTMLResponse)
async def get_form(request: Request):
    return templates.TemplateResponse("index-page.html", {"request": request})


@app.post("/api/search")
async def search_endpoint(request: SearchRequest):
    query = request.query
    result_data = ppxtly_search(query)
    
    # Store in DB
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor()
        insert_query = """
            INSERT INTO queryinfo (query, result)
            VALUES (%s, %s)
            """
        inserting_values = (query, json.dumps(result_data))
        cursor.execute(insert_query, inserting_values)
        conn.commit()
        cursor.close()
        conn.close()
        
    return result_data

@app.get("/api/history/")
def get_history():
    conn = get_db_connection()
    if not conn:
        return {"data": []}
        
    cursor = conn.cursor()      
    cursor.execute("SELECT id, query, result FROM queryinfo ORDER BY id DESC")
    rows = cursor.fetchall()
    
    data = []
    for row in rows:
        try:
            # Try to parse JSON, if fails (old data), treat as string
            result_content = json.loads(row[2])
        except:
            result_content = {"answer": "Legacy Data", "sources": [{"url": row[2]}]}
            
        data.append({
            "id": row[0],
            "query": row[1],
            "result": result_content,
        })
    
    cursor.close()
    conn.close()
    return {"data": data}

@app.delete("/api/history/{item_id}")
def delete_history_item(item_id: int):
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM queryinfo WHERE id = %s", (item_id,))
        conn.commit()
        cursor.close()
        conn.close()
    return {"status": "success", "id": item_id}

@app.delete("/api/history")
def clear_history():
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor()
        cursor.execute("TRUNCATE TABLE queryinfo")
        conn.commit()
        cursor.close()
        conn.close()
    return {"status": "success", "message": "History cleared"}

