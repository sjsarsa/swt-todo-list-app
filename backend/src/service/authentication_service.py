from http import HTTPStatus

from fastapi import HTTPException
from passlib.context import CryptContext
from pydantic import BaseModel
from starlette.authentication import AuthenticationError

from core import jwt
from core.database import database
from service import user_service


class AuthData(BaseModel):
    userId: int
    username: str
    accessToken: str
    refreshToken: str


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


@database.transaction()
async def register(username: str, password: str) -> AuthData:
    password = pwd_context.hash(password)

    created_user = await user_service.create_user(
        username=username,
        password=password
    )

    print("created_user")
    print(created_user)
    access_token = jwt.encode(
        payload={"user_id": created_user.id, "username": created_user.username})
    refresh_token = jwt.encode(payload={"sub": "refresh_token"})
    return AuthData(userId=created_user.id, username=created_user.username, accessToken=access_token, refreshToken=refresh_token)


async def login(username: str, password: str) -> AuthData:
    user = await user_service.find_user(username=username)

    if not user or not verify_password(password, user.password):
        raise HTTPException(status_code=HTTPStatus.UNAUTHORIZED,
                            detail="Incorrect username or password")

    access_token = jwt.encode(
        payload={"user_id": user.id, "username": user.username})
    refresh_token = jwt.encode(payload={"sub": "refresh_token"})
    return AuthData(userId=user.id, username=username, accessToken=access_token, refreshToken=refresh_token)


async def refresh_token(access_token: str, refresh_token: str) -> AuthData:
    # A murky error is given without this try catch and frontend won't know to redirect to login
    try:
        refresh_token_decoded = jwt.decode(refresh_token)
    except AuthenticationError as e:
        raise HTTPException(status_code=HTTPStatus.UNAUTHORIZED,
                            detail=str(e))

    if refresh_token_decoded.get("sub") != "refresh_token":
        raise HTTPException(status_code=HTTPStatus.UNAUTHORIZED,
                            detail="Invalid refresh token")

    access_token_decoded = jwt.decode_expired(access_token)
    user_id = access_token_decoded.get("user_id")
    username = access_token_decoded.get("username")
    if not user_id or not username:
        raise HTTPException(status_code=HTTPStatus.UNAUTHORIZED,
                            detail="Invalid access token")

    access_token = jwt.encode(
        payload={"user_id": user_id, "username": username})
    refresh_token = jwt.encode(payload={"sub": "refresh_token"})

    return AuthData(userId=user_id, username=username, accessToken=access_token, refreshToken=refresh_token)
