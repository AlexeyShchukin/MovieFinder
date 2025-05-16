from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DB_HOST: str
    DB_USER: str
    DB_PASS: str
    DB_NAME: str

    def dbconfig(self):
        return {
            'host': self.DB_HOST,
            'user': self.DB_USER,
            'password': self.DB_PASS,
            'database': self.DB_NAME
        }

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()