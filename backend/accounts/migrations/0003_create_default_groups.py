from django.db import migrations
from django.contrib.auth.models import Group


def create_default_groups(apps, schema_editor):
    groups = ["HR Manager", "HR Recruiter", "IT Support", "Applicant"]
    for g in groups:
        Group.objects.get_or_create(name=g)


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_user_role'),
    ]

    operations = [
        migrations.RunPython(create_default_groups),
    ]
