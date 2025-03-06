from fastapi import APIRouter, Request
from pydantic import BaseModel

from dto.response_dtos import UserDto
from model.user import User
from service import authentication_service, user_service
from service.authentication_service import AuthData

user_router = APIRouter()


class CredentialsRequest(BaseModel):
    username: str
    password: str


class TokenRefreshRequest(BaseModel):
    accessToken: str
    refreshToken: str


class FindUsersRequest(BaseModel):
    query_string: str


@user_router.post("/login")
async def login(body: CredentialsRequest) -> AuthData:
    return await authentication_service.login(body.username, body.password)


@user_router.post("/")
async def register(body: CredentialsRequest) -> AuthData:
    return await authentication_service.register(body.username, body.password)


@user_router.post("/refresh-token")
async def refresh_token(body: TokenRefreshRequest) -> AuthData:
    return await authentication_service.refresh_token(body.accessToken, body.refreshToken)


@user_router.get("/")
async def find_users(request: Request) -> list[UserDto]:
    users = await user_service.find_users(query_string=request.query_params.get("queryString"))
    return [UserDto.from_user(user) for user in users]

