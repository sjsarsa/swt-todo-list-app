from typing import Tuple

from core import jwt
from starlette.authentication import AuthCredentials, AuthenticationBackend, AuthenticationError, SimpleUser, UnauthenticatedUser
from starlette.requests import HTTPConnection


class CurrentUser(SimpleUser):
    id: int

    def __init__(self, id: int, username: str) -> None:
        self.id = id
        self.username = username

    @property
    def user_id(self) -> int:
        return self.id


class AuthBackend(AuthenticationBackend):
    async def authenticate(
        self, conn: HTTPConnection
    ) -> Tuple[AuthCredentials, CurrentUser | UnauthenticatedUser] | None:
        authorization = conn.headers.get("Authorization")
        if not authorization:
            print("No authorization header")
            return AuthCredentials(["unauthenticated"]), UnauthenticatedUser()

        try:
            scheme, token = authorization.split(" ")
            if scheme.lower() != "bearer":
                raise AuthenticationError("No bearer in authorization header")
        except ValueError:
            raise AuthenticationError("Invalid authorization header")

        if not token:
            raise AuthenticationError("No token provided")

        payload = jwt.decode(
            token,
        )
        user_id = payload.get("user_id")
        user_name = payload.get("username")

        if not user_id or not user_name:
            raise AuthenticationError("Invalid token")

        current_user = CurrentUser(user_id, user_name)
        return AuthCredentials(["authenticated"]), current_user
