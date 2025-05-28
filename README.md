# MovieFinder

MovieFinder is a web application for discovering movies with built-in search analytics.

### User-Facing Features

- Advanced case-insensitive search by title, genre, actors, and release year


- Smart Autocomplete with real-time suggestions (title, genres, actors) 


- Popular Searches section showcasing trending queries


- Search Analytics tracking and visualization of user patterns


- Popup panel with user manual

###   Technical Highlights

- Implemented Clean Architecture with FastAPI: used layered structure (`endpoints`, `repositories`)


- Applied Unit of Work and Repository patterns for database interaction


- Logged user search queries to MySQL for full analytics coverage


- Displayed popular search queries with clickable suggestions

 
- Implemented real-time autocomplete for titles, genres and actors


- Added offset-based pagination with dynamic data loading


- Standardized API error responses with custom error handling


- Logged all incoming and outgoing HTTP requests via middleware


- Documented all endpoints via OpenAPI/Swagger UI


[Presentation](https://docs.google.com/presentation/d/1BeDnwsOjoDTJx3C6l3Uev6zYfqT03Sb0Wf8BqadMFmg/edit?slide=id.p#slide=id.p)
