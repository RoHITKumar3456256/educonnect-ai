import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.core.database import init_db, get_db_connection
from backend.app.api import profiles, discovery, saved, analytics

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database and seed data are ready
    print(f"Initializing {settings.PROJECT_NAME} database...")
    init_db()
    print("Database ready.")
    yield
    # Shutdown
    print(f"Shutting down {settings.PROJECT_NAME} backend.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-powered school influencer discovery platform that analyses reference profiles, discovers similar education professionals, and ranks them using semantic similarity, professional experience, and school ecosystem relevance.",
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS configuration
origins = [
    settings.FRONTEND_ORIGIN,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health endpoint
@app.get("/health", tags=["System"])
def health_check():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM profiles;")
    count = cursor.fetchone()[0]
    conn.close()
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": "connected",
        "active_profiles": count,
        "embedding_model": settings.EMBEDDING_MODEL
    }

# Register API routes
app.include_router(profiles.router, prefix=settings.API_V1_STR)
app.include_router(discovery.router, prefix=settings.API_V1_STR)
app.include_router(saved.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)

