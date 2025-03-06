from datetime import datetime, timedelta, UTC
from jose import ExpiredSignatureError, JWTError, jwt
from starlette.authentication import AuthenticationError
import os

# TODO: move constants to config/env

SECRET_KEY = os.environ["SECRET_KEY"]
ALGORITHM = os.environ["TOKEN_ENCRYPTION_ALGORITHM"]
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"])
REFRESH_TOKEN_EXPIRE_DAYS = int(os.environ["REFRESH_TOKEN_EXPIRE_DAYS"])


jwtDecodeError = AuthenticationError("Invalid token")
jwtExpiredError = AuthenticationError("Token has expired")


def encode(payload: dict) -> str:
    now = datetime.now(UTC)
    if payload.get("sub") == "refresh_token":
        expire = now + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    else:
        expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload.update({"exp": expire})
    return jwt.encode(
        payload, SECRET_KEY, algorithm=ALGORITHM
    )


def decode(token: str) -> dict:
    try:
        return jwt.decode(
            token, SECRET_KEY, algorithms=[ALGORITHM]
        )
    except ExpiredSignatureError:
        raise jwtExpiredError
    except JWTError:
        raise jwtDecodeError


@staticmethod
def decode_expired(token: str) -> dict:
    try:
        return jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            options={"verify_exp": False},
        )
    except JWTError:
        raise jwtDecodeError
