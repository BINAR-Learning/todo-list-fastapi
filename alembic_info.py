# Alembic ini untuk database migration (advanced usage)
# Untuk development sederhana, SQLAlchemy create_all() sudah cukup

"""Initial migration

Revision ID: 001
Revises: 
Create Date: 2025-07-02 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Buat tables jika menggunakan alembic
    pass

def downgrade():
    # Drop tables jika menggunakan alembic
    pass
