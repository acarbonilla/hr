"""
Django management command to create position types and question types
Usage: python manage.py create_position_types
"""

from django.core.management.base import BaseCommand
from interviews.type_models import PositionType, QuestionType


class Command(BaseCommand):
    help = 'Creates position types and question types in the database'

    def handle(self, *args, **options):
        self.stdout.write('Creating Position Types...')
        
        # Position types data matching the frontend
        position_types_data = [
            {
                'code': 'virtual_assistant',
                'name': 'Virtual Assistant',
                'description': 'Provide remote administrative support including calendar management, email handling, scheduling, and document organization.',
                'order': 1
            },
            {
                'code': 'customer_service',
                'name': 'Customer Service',
                'description': 'Assist customers with inquiries, resolve issues, provide product information, and ensure customer satisfaction.',
                'order': 2
            },
            {
                'code': 'it_support',
                'name': 'IT Support',
                'description': 'Provide technical assistance, troubleshoot hardware and software issues, and support end-users with technology needs.',
                'order': 3
            },
            {
                'code': 'sales_marketing',
                'name': 'Sales and Marketing',
                'description': 'Drive sales growth, develop marketing campaigns, manage leads, and build customer relationships to achieve revenue targets.',
                'order': 4
            },
            {
                'code': 'general',
                'name': 'General Position',
                'description': 'Open application for various roles. Interview will include general questions applicable to multiple positions.',
                'order': 5
            },
        ]
        
        created_positions = 0
        updated_positions = 0
        
        for pos_data in position_types_data:
            position, created = PositionType.objects.update_or_create(
                code=pos_data['code'],
                defaults={
                    'name': pos_data['name'],
                    'description': pos_data['description'],
                    'order': pos_data['order'],
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Created: {position.name}'))
                created_positions += 1
            else:
                self.stdout.write(self.style.WARNING(f'  ⟳ Updated: {position.name}'))
                updated_positions += 1
        
        self.stdout.write('\nCreating Question Types...')
        
        # Question types data
        question_types_data = [
            {
                'code': 'general',
                'name': 'General',
                'description': 'General questions about background and experience',
                'order': 1
            },
            {
                'code': 'behavioral',
                'name': 'Behavioral',
                'description': 'Questions about past experiences and behavior',
                'order': 2
            },
            {
                'code': 'situational',
                'name': 'Situational',
                'description': 'Hypothetical scenario-based questions',
                'order': 3
            },
            {
                'code': 'technical',
                'name': 'Technical',
                'description': 'Technical skills and knowledge questions',
                'order': 4
            },
        ]
        
        created_questions = 0
        updated_questions = 0
        
        for q_data in question_types_data:
            question_type, created = QuestionType.objects.update_or_create(
                code=q_data['code'],
                defaults={
                    'name': q_data['name'],
                    'description': q_data['description'],
                    'order': q_data['order'],
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Created: {question_type.name}'))
                created_questions += 1
            else:
                self.stdout.write(self.style.WARNING(f'  ⟳ Updated: {question_type.name}'))
                updated_questions += 1
        
        self.stdout.write('\n' + '='*70)
        self.stdout.write(self.style.SUCCESS('\n✓ Summary:'))
        self.stdout.write(f'  Position Types - Created: {created_positions}, Updated: {updated_positions}')
        self.stdout.write(f'  Question Types - Created: {created_questions}, Updated: {updated_questions}')
        self.stdout.write(f'\n  Total Position Types: {PositionType.objects.count()}')
        self.stdout.write(f'  Total Question Types: {QuestionType.objects.count()}')
