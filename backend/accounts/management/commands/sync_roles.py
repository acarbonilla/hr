from django.core.management.base import BaseCommand
from accounts.models import User, ROLE_GROUP_MAP
from django.contrib.auth.models import Group


class Command(BaseCommand):
    help = "Synchronizes user.role with Django groups"

    def handle(self, *args, **kwargs):
        for user in User.objects.all():
            role = user.role
            group_name = ROLE_GROUP_MAP.get(role)

            if not group_name:
                self.stdout.write(f"Skipping {user.username}, unknown role={role}")
                continue

            group, _ = Group.objects.get_or_create(name=group_name)
            user.groups.clear()
            user.groups.add(group)

            self.stdout.write(f"Updated {user.username}: role={role} \u2192 group={group_name}")
