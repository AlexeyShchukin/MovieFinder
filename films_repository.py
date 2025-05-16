class FilmRepository:
    def __init__(self, cursor):
        self.cursor = cursor

    def get_filtered(self, page, genre, actor, year):
        query = 'SELECT f.title, f.release_year, f.description FROM film f'
        joins = []
        conditions = []
        params = []

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
