from App import app, db, User, AuthenticationLog
import numpy as np
import sys

def init_database():
    with app.app_context():
        db.create_all()
        print("✅ Database tables created successfully")

def create_sample_user():
    with app.app_context():
        if User.query.filter_by(username='demo_user').first():
            print("⚠️  Sample user already exists")
            return
        sample_hash = ','.join(map(str, np.random.randint(0, 2, 128).tolist()))
        user = User(username='demo_user', email='demo@example.com',
                   multimodal_hash=sample_hash, is_active=True)
        user.set_password('demo123')
        db.session.add(user)
        db.session.commit()
        print("✅ Sample user created:")
        print(f"   Username: demo_user")
        print(f"   Password: demo123")

def reset_database():
    with app.app_context():
        db.drop_all()
        print("🗑️  Dropped all tables")
        db.create_all()
        print("✅ Recreated all tables")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python db_init.py [init|sample|reset]")
        sys.exit(1)
    command = sys.argv[1]
    if command == 'init':
        init_database()
    elif command == 'sample':
        create_sample_user()
    elif command == 'reset':
        confirm = input("⚠️  Delete ALL data? Type 'yes': ")
        if confirm.lower() == 'yes':
            reset_database()
    else:
        print(f"❌ Unknown command: {command}")