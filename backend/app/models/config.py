from peewee import PostgresqlDatabase
import os

# db = MySQLDatabase(
#     os.getenv("DB_NAME", "paroquia"),
#     user=os.getenv("DB_USER", "root"),
#     password=os.getenv("DB_PASS", "root"),
#     host=os.getenv("DB_HOST", "localhost"),
#     port=int(os.getenv("DB_PORT", 3306))
# )

db = PostgresqlDatabase(
    os.getenv("DB_NAME", "paroquia"),
    user=os.getenv("DB_USER", "root"),
    password=os.getenv("DB_PASS", "root"),
    host=os.getenv("DB_HOST", "localhost"),
    port=int(os.getenv("DB_PORT", 5432))
)