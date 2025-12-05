"""
Django management command to assign user to a group
Usage: python manage.py assign_user_group <username> <group_name>
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group
from accounts.models import User


class Command(BaseCommand):
    help = 'Assign a user to a group'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Username to assign')
        parser.add_argument('group', type=str, help='Group name (HR Recruiter, HR Manager, IT Support, Applicant)')

    def handle(self, *args, **options):
        username = options['username']
        group_name = options['group']
        
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'❌ User "{username}" does not exist'))
            return
        
        try:
            group = Group.objects.get(name=group_name)
        except Group.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'❌ Group "{group_name}" does not exist'))
            self.stdout.write('Available groups:')
            for g in Group.objects.all():
                self.stdout.write(f'   - {g.name}')
            return
        
        # Add user to group
        user.groups.add(group)
        user.is_staff = True  # Allow admin access
        user.save()
        
        self.stdout.write(self.style.SUCCESS(f'✅ Added "{username}" to group "{group_name}"'))
        self.stdout.write(f'   User: {user.email}')
        self.stdout.write(f'   Staff: Yes')
        self.stdout.write(f'   Groups: {", ".join([g.name for g in user.groups.all()])}')
