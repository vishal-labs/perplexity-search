### Introduction
This is a project that I keep on developing as i learn more of API and AI.

Right now, the functionality are listed below
- When run, this application takes in the user query
- Uses Perplexity Search API to get the most relevant URLs for the query
- Returns any 1 or the URL to the frontend.
- Adds the query along with the result to a database for future references.
- Whenever an API endpoint is accessed, the endpoint string is verified throught a ML model and based on the prediction, the endpoint is secured with the power of eBPF
Ex: We know that the general, regular endpoints look like /home, /api/users ... 
but we also know that endpoints like /SELECT+*+FROM+USERS; or such are SQLi type attacks.


### How to run?
1. Get the perplexity API key from your account
2. Add it to the  `.env` file with the name `PERPLEXITY_API_KEY`
3. install the requirements by running the `pip install -r requirements.txt` file. 
4. Run the application by using the command `fastapi dev main.py`

### Functionalities for future improvement
1. Because the DB is connected, we could make the frontend functionally beautiful like adding more endpoints where history can be seen(whatever was stored in the DB)
2. Run this entire setup on kubernetes by creating different pods and services to that pods(this will help my understanding of kubernetes services)
3. create user logins for retrieving past queries for that user. 


### Example showcase
1. Query input:
<img width="1216" height="779" alt="image" src="https://github.com/user-attachments/assets/74029e09-cda0-4369-9327-b7a4b7dcaad7" />


2. Result:
<img width="1610" height="1085" alt="image" src="https://github.com/user-attachments/assets/91df1989-9222-4391-bb31-182e80258e7e" />



3. Database(need to make it pretty)
<img width="1112" height="622" alt="image" src="https://github.com/user-attachments/assets/d2406633-81f8-4992-9c7f-a5dd24af68cf" />

