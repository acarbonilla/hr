from django.db import migrations


def seed_position_types(apps, schema_editor):
    PositionType = apps.get_model('interviews', 'PositionType')
    defaults = [
        ("it_support", "IT Support"),
        ("customer_service", "Customer Service"),
        ("technical", "Technical"),
        ("admin", "Admin"),
    ]
    for code, name in defaults:
        PositionType.objects.get_or_create(code=code, defaults={"name": name, "description": name})


class Migration(migrations.Migration):

    dependencies = [
        ('interviews', '0015_question_tags_position_subroles'),
    ]

    operations = [
        migrations.RunPython(seed_position_types, migrations.RunPython.noop),
    ]

