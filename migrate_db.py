#!/usr/bin/env python3
"""
Database migration script to add email column to users table.
Run this script to update existing database with new email field.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.database import engine
from app.models.user import User
from app.config import settings

def migrate_database():
    """
    Add email column to existing users table
    """
    print("Starting database migration...")
    
    try:
        with engine.connect() as connection:
            # Check if email column exists
            result = connection.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='users' AND column_name='email'
            """))
            
            email_column_exists = result.fetchone() is not None
            
            if not email_column_exists:
                print("Adding email column to users table...")
                # Add email column
                connection.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN email VARCHAR UNIQUE
                """))
                
                # Add is_verified column
                connection.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN is_verified BOOLEAN DEFAULT FALSE
                """))
                
                # Make username nullable
                connection.execute(text("""
                    ALTER TABLE users 
                    ALTER COLUMN username DROP NOT NULL
                """))
                
                connection.commit()
                print("✅ Database migration completed successfully!")
            else:
                print("✅ Email column already exists. No migration needed.")
                
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        print("Note: If using SQLite, columns might be added automatically when the application starts.")

if __name__ == "__main__":
    migrate_database()
