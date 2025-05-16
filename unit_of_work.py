from mysql.connector import connect

from config import settings
from films_repository import FilmRepository


class UnitOfWork:
    def __init__(self):
        self.dbconfig = settings.dbconfig()
        self.connection = None
        self.cursor = None

    def __enter__(self):
        self.connection = connect(**self.dbconfig)
        self.cursor = self.connection.cursor(dictionary=True)

        self.films = FilmRepository(self.cursor)

        return self

    def __exit__(self, exc_type, exc_val, traceback):
        if exc_type:
            self.connection.rollback()
        else:
            self.connection.commit()

        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.connection.close()

    def commit(self):
        if self.connection:
            self.connection.commit()

    def rollback(self):
        if self.connection:
            self.connection.rollback()
