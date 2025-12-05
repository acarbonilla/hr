"""
Script to create IT staff user with monitoring permissions
Usage: python manage.py shell < create_it_user.py
"""
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from monitoring.models import TokenUsage, DailyTokenSummary

User = get_user_model()

# Create IT user
username = input("Enter username for IT user: ")
email = input("Enter email: ")
password = input("Enter password: ")

user, created = User.objects.get_or_create(
    username=username,
    defaults={
        'email': email,
        'is_staff': True,  # Can access admin
        'is_superuser': False,  # Not superuser
    }
)

if created:
    user.set_password(password)
    user.save()
    print(f"✅ Created IT user: {username}")
else:
    print(f"⚠️  User {username} already exists, updating permissions...")

# Grant monitoring permissions
token_usage_ct = ContentType.objects.get_for_model(TokenUsage)
daily_summary_ct = ContentType.objects.get_for_model(DailyTokenSummary)

permissions = [
    Permission.objects.get(content_type=token_usage_ct, codename='view_tokenusage'),
    Permission.objects.get(content_type=daily_summary_ct, codename='view_dailytokensummary'),
]

user.user_permissions.add(*permissions)
print(f"✅ Granted monitoring view permissions")
print(f"\n🔐 IT User Details:")
print(f"   Username: {username}")
print(f"   Email: {email}")
print(f"   Staff: Yes")
print(f"   Superuser: No")
print(f"   Permissions: View token monitoring data")
print(f"\n🌐 Admin access: http://localhost:8000/admin/")
