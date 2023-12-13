from fastapi import FastAPI

app = FastAPI()


@app.get("/")
async def root():
    print("Hello")
    return {"message": "Hello World"}