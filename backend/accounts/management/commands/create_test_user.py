"""
Django management command to create a test user for authentication testing
Usage: python manage.py create_test_user
"""

from django.core.management.base import BaseCommand
from accounts.models import User


class Command(BaseCommand):
    help = 'Creates a test user for authentication testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            default='testuser',
            help='Username for the test user'
        )
        parser.add_argument(
            '--password',
            type=str,
            default='TestPass123!',
            help='Password for the test user'
        )
        parser.add_argument(
            '--email',
            type=str,
            default='test@hirenow.com',
            help='Email for the test user'
        )
        parser.add_argument(
            '--user-type',
            type=str,
            default='recruiter',
            choices=['recruiter', 'hr_admin', 'system_admin'],
            help='User type'
        )

    def handle(self, *args, **options):
        username = options['username']
        password = options['password']
        email = options['email']
        user_type = options['user_type']

        # Check if user already exists
        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(f'User "{username}" already exists!')
            )
            user = User.objects.get(username=username)
            self.stdout.write(
                self.style.SUCCESS(f'Existing user details:')
            )
            self.stdout.write(f'  Username: {user.username}')
            self.stdout.write(f'  Email: {user.email}')
            self.stdout.write(f'  User Type: {user.user_type}')
            self.stdout.write(f'  ID: {user.id}')
            return

        # Create new user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            user_type=user_type,
            first_name='Test',
            last_name='User'
        )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created test user!')
        )
        self.stdout.write(f'  Username: {username}')
        self.stdout.write(f'  Password: {password}')
        self.stdout.write(f'  Email: {email}')
        self.stdout.write(f'  User Type: {user_type}')
        self.stdout.write(f'  ID: {user.id}')
        self.stdout.write('\n')
        self.stdout.write(
            self.style.SUCCESS('You can now login with these credentials!')
        )
        self.stdout.write(f'  Frontend: http://localhost:3000/login')
        self.stdout.write(f'  API: POST http://localhost:8000/api/auth/login/')
