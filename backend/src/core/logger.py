import logging
import logging.config
import os

ROOT_LEVEL = os.environ.get('PROD', "INFO")

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": True,
    "formatters": {
        "standard": {"format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s"},
    },
    "handlers": {
        "default": {
            "level": "INFO",
            "formatter": "standard",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stdout",  # Default is stderr
        },
    },
    "loggers": {
        "root": {  # root logger
            "level": ROOT_LEVEL,  # "INFO",
            "handlers": ["default"],
            "propagate": False,
        },
        "uvicorn.error": {
            "level": "DEBUG",
            "handlers": ["default"],
            "propagate": False,
        },
        "uvicorn.access": {
            "level": "DEBUG",
            "handlers": ["default"],
            "propagate": False,
        },
        "databases": {
            "level": "DEBUG",
            "handlers": ["default"],
            "propagate": False,
        },
    },
    "root": {
        "level": ROOT_LEVEL,  # "INFO",
        "handlers": ["default"],
        "propagate": False,
    },
}



logging.config.dictConfig(LOGGING_CONFIG)
logging.getLogger("app")

