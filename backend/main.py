from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import agent
from pydantic import BaseModel

# --- Configuration ---

# --- Configuration ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    image: str
    genres: List[str]

class CompareRequest(BaseModel):
    bookA: dict
    bookB: dict

# --- Existing Endpoints ---
@app.post("/analyze")
async def analyze_bookshelf_endpoint(request: AnalyzeRequest):
    result = await agent.analyze_bookshelf(request.image, request.genres)
    return result

@app.post("/compare")
async def compare_books_endpoint(request: CompareRequest):
    result = await agent.compare_books(request.bookA, request.bookB)
    return {"comparison": result}
