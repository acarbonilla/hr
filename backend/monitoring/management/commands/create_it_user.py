from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from monitoring.models import TokenUsage, DailyTokenSummary

User = get_user_model()


class Command(BaseCommand):
    help = 'Create an IT staff user with monitoring view permissions'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Username for the IT user')
        parser.add_argument('--email', type=str, default='', help='Email address')
        parser.add_argument('--password', type=str, help='Password (will prompt if not provided)')

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options.get('password')

        # Prompt for password if not provided
        if not password:
            from getpass import getpass
            password = getpass('Password: ')
            password_confirm = getpass('Password (again): ')
            
            if password != password_confirm:
                self.stdout.write(self.style.ERROR('❌ Passwords do not match'))
                return

        # Create or get user
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'is_staff': True,  # Can access admin
                'is_superuser': False,  # NOT superuser
            }
        )

        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f'✅ Created IT staff user: {username}'))
        else:
            self.stdout.write(self.style.WARNING(f'⚠️  User {username} already exists, updating permissions...'))
            user.is_staff = True
            user.is_superuser = False
            user.save()

        # Grant monitoring view permissions
        try:
            token_usage_ct = ContentType.objects.get_for_model(TokenUsage)
            daily_summary_ct = ContentType.objects.get_for_model(DailyTokenSummary)

            permissions = [
                Permission.objects.get(content_type=token_usage_ct, codename='view_tokenusage'),
                Permission.objects.get(content_type=daily_summary_ct, codename='view_dailytokensummary'),
            ]

            user.user_permissions.add(*permissions)
            self.stdout.write(self.style.SUCCESS('✅ Granted monitoring view permissions'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error granting permissions: {e}'))

        # Display summary
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('🔐 IT User Created Successfully!'))
        self.stdout.write(f'   Username: {username}')
        self.stdout.write(f'   Email: {email or "(not set)"}')
        self.stdout.write(f'   Staff: ✅ Yes')
        self.stdout.write(f'   Superuser: ❌ No (Safe)')
        self.stdout.write(f'   Permissions: View token monitoring data')
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('🌐 Admin access: http://localhost:8000/admin/'))
        self.stdout.write(self.style.SUCCESS('📊 Token monitoring: http://localhost:3000/hr-dashboard/token-monitoring'))
