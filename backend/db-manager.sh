#!/bin/bash

# Database Management Script for Unilodge

echo "🗄️  Unilodge Database Manager"
echo "=============================="
echo ""

case "$1" in
  seed)
    echo "🌱 Seeding database with initial data..."
    cd "$(dirname "$0")"
    export SEED_DATABASE=true
    npm run dev
    ;;
    
  reset)
    echo "🧹 Resetting database..."
    mongosh unilodge --eval "db.dropDatabase()"
    echo "✅ Database cleared!"
    echo ""
    echo "💡 To add initial data, run: ./db-manager.sh seed"
    ;;
    
  users)
    echo "👥 Creating default users only..."
    mongosh unilodge --eval "
      db.users.insertOne({
        name: 'Admin User',
        email: 'admin@campus.edu',
        password: '\$2a\$10\$X8o5qQZxJhOqKQ5BxC8qJeGrN8YK9LZp8tQ5nK6QK5BxC8qJeGrN8',
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      db.users.insertOne({
        name: 'Guest User',
        email: 'guest@visitor.com',
        password: '\$2a\$10\$Y9p6rRYxJhOqKQ5BxC8qJeGrN8YK9LZp8tQ5nK6QK5BxC8qJeGrN9',
        role: 'GUEST',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    "
    echo "✅ Users created!"
    echo "   Admin: admin@campus.edu / admin123"
    echo "   Guest: guest@visitor.com / guest123"
    ;;
    
  status)
    echo "📊 Database Status:"
    mongosh unilodge --quiet --eval "
      print('Users: ' + db.users.countDocuments());
      print('Rooms: ' + db.rooms.countDocuments());
      print('Bookings: ' + db.bookings.countDocuments());
      print('Booking Requests: ' + db.bookingrequests.countDocuments());
      print('Contacts: ' + db.contacts.countDocuments());
    "
    ;;
    
  *)
    echo "Usage: ./db-manager.sh [command]"
    echo ""
    echo "Commands:"
    echo "  seed    - Seed database with initial users and rooms"
    echo "  reset   - Clear entire database"
    echo "  users   - Create only default users"
    echo "  status  - Show database statistics"
    echo ""
    echo "Examples:"
    echo "  ./db-manager.sh reset     # Clear everything"
    echo "  ./db-manager.sh users     # Add default users"
    echo "  ./db-manager.sh status    # Check what's in DB"
    ;;
esac
