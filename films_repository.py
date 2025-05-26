class FilmRepository:
    def __init__(self, cursor):
        self.cursor = cursor

    def get_filtered(self, page, title, genre, actor, year):
        query = 'SELECT f.title, f.release_year, f.description FROM film f'
        joins = []
        conditions = []
        params = []

        if title:
            conditions.append('f.title LIKE %s')
            params.append(f'%{title}%')

        if genre:
            joins.append('JOIN film_category fc ON f.film_id = fc.film_id')
            joins.append('JOIN category c ON fc.category_id = c.category_id')
            conditions.append('c.name = %s')
            params.append(genre)

        if actor:
            joins.append('JOIN film_actor fa ON f.film_id = fa.film_id')
            joins.append('JOIN actor a ON fa.actor_id = a.actor_id')
            conditions.append("CONCAT(a.first_name, ' ', a.last_name) LIKE %s")
            params.append(f'%{actor}%')

        if year:
            conditions.append('f.release_year = %s')
            params.append(year)

        if joins:
            query += ' ' + ' '.join(joins)

        if conditions:
            query += ' WHERE ' + ' AND '.join(conditions)

        query += ' LIMIT 10 OFFSET %s'
        params.append((page - 1) * 10)

        self.cursor.execute(query, params)
        return self.cursor.fetchall()

    def _is_query_in_db(self, title, genre, actor, year):
        query = 'SELECT query_id FROM log_query WHERE '
        conditions = []
        values = []

        if title is None:
            conditions.append('title IS NULL')
        else:
            conditions.append('title = %s')
            values.append(title)

        if genre is None:
            conditions.append('genre IS NULL')
        else:
            conditions.append('genre = %s')
            values.append(genre)

        if actor is None:
            conditions.append('actor IS NULL')
        else:
            conditions.append('actor = %s')
            values.append(actor)

        if year is None:
            conditions.append('year IS NULL')
        else:
            conditions.append('year = %s')
            values.append(year)

        query += ' AND '.join(conditions)
        self.cursor.execute(query, values)
        return self.cursor.fetchone()

    def log_query(self, title, genre, actor, year):
        if title is None and genre is None and actor is None and year is None:
            return

        query = self._is_query_in_db(title, genre, actor, year)
        if query:
            self.cursor.execute('''UPDATE log_query SET count = count + 1
            WHERE query_id = %s''', (query['query_id'],))
        else:
            self.cursor.execute('''INSERT INTO log_query (title, genre, actor, year, count) 
            VALUES (%s, %s, %s, %s, 1)''', (title, genre, actor, year))

    def get_top_queries(self, limit):
        self.cursor.execute('''SELECT title, genre, actor, year, count FROM log_query 
        ORDER BY count DESC LIMIT %s''', (limit,))
        return self.cursor.fetchall()

    def autocomplete(self, field, query):
        if field == "title":
            self.cursor.execute(
                '''SELECT DISTINCT title FROM film 
                WHERE title LIKE %s LIMIT 10''',
                (f'{query}%',)
            )
        elif field == 'actor':
            self.cursor.execute('''
                    SELECT DISTINCT CONCAT(a.first_name, ' ', a.last_name) as name
                    FROM actor a
                    WHERE a.first_name LIKE %s OR a.last_name LIKE %s
                    LIMIT 10
                ''', (f'{query}%', f'{query}%'))
        elif field == 'genre':
            if not query:
                self.cursor.execute('''
                        SELECT name FROM category 
                        ORDER BY name
                        LIMIT 20
                    ''')
            else:
                self.cursor.execute('''
                        SELECT name FROM category 
                        WHERE name LIKE %s 
                        ORDER BY name
                        LIMIT 10
                    ''', (f'{query}%',))
        return [row[list(row.keys())[0]].title() for row in self.cursor.fetchall()]
