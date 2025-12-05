from django.core.management.base import BaseCommand
from training.models import TrainingModule

class Command(BaseCommand):
    help = 'Seeds initial training modules'

    def handle(self, *args, **kwargs):
        modules = [
            {
                'name': 'General Interview Skills',
                'description': 'Practice common interview questions to improve your confidence and clarity.',
                'order': 1
            },
            {
                'name': 'Behavioral Questions',
                'description': 'Master the STAR method (Situation, Task, Action, Result) for behavioral questions.',
                'order': 2
            },
            {
                'name': 'Technical Communication',
                'description': 'Learn how to explain complex technical concepts simply and effectively.',
                'order': 3
            },
            {
                'name': 'Leadership & Soft Skills',
                'description': 'Demonstrate your leadership potential and emotional intelligence.',
                'order': 4
            }
        ]

        for module_data in modules:
            module, created = TrainingModule.objects.get_or_create(
                name=module_data['name'],
                defaults=module_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created module: {module.name}'))
            else:
                self.stdout.write(f'Module already exists: {module.name}')
