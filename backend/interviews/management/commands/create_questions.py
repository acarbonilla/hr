"""
Django management command to create sample questions for each position type
Usage: python manage.py create_questions
"""

from django.core.management.base import BaseCommand
from interviews.models import InterviewQuestion
from interviews.type_models import PositionType, QuestionType
from datetime import timedelta


class Command(BaseCommand):
    help = 'Creates sample interview questions for each position type'

    def add_arguments(self, parser):
        parser.add_argument(
            '--position',
            type=str,
            help='Position type code to create questions for (e.g., virtual_assistant)'
        )

    def handle(self, *args, **options):
        position_filter = options.get('position')
        
        # Get position types and question types
        try:
            position_types = {pt.code: pt for pt in PositionType.objects.filter(is_active=True)}
            question_types = {qt.code: qt for qt in QuestionType.objects.filter(is_active=True)}
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error loading types: {e}'))
            self.stdout.write(self.style.WARNING('Run: python manage.py create_position_types first'))
            return
        
        questions_data = {
            'virtual_assistant': [
                {
                    'question_text': 'Describe your experience with managing calendars, scheduling meetings, and coordinating appointments for executives or teams.',
                    'question_type': 'behavioral',
                    'order': 1
                },
                {
                    'question_text': 'How do you prioritize tasks when handling multiple requests from different team members simultaneously?',
                    'question_type': 'situational',
                    'order': 2
                },
                {
                    'question_text': 'What tools and software are you proficient in for document management, communication, and project tracking?',
                    'question_type': 'technical',
                    'order': 3
                },
                {
                    'question_text': 'Tell us about a time when you had to handle a difficult or urgent request from a client or supervisor remotely.',
                    'question_type': 'behavioral',
                    'order': 4
                },
                {
                    'question_text': 'How do you maintain organization and efficiency while working independently from home?',
                    'question_type': 'general',
                    'order': 5
                },
            ],
            'customer_service': [
                {
                    'question_text': 'Describe a situation where you turned an unhappy customer into a satisfied one. What steps did you take?',
                    'question_type': 'behavioral',
                    'order': 1
                },
                {
                    'question_text': 'How would you handle a customer who is upset about a problem that is not your fault or within your control?',
                    'question_type': 'situational',
                    'order': 2
                },
                {
                    'question_text': 'What customer service software or CRM systems have you used, and what is your experience level with them?',
                    'question_type': 'technical',
                    'order': 3
                },
                {
                    'question_text': 'How do you stay patient and professional when dealing with difficult or irate customers?',
                    'question_type': 'behavioral',
                    'order': 4
                },
                {
                    'question_text': 'What does excellent customer service mean to you?',
                    'question_type': 'general',
                    'order': 5
                },
            ],
            'it_support': [
                {
                    'question_text': 'Walk us through your troubleshooting process when a user reports their computer is running slowly.',
                    'question_type': 'technical',
                    'order': 1
                },
                {
                    'question_text': 'Describe a time when you had to explain a complex technical issue to someone with limited technical knowledge.',
                    'question_type': 'behavioral',
                    'order': 2
                },
                {
                    'question_text': 'How would you prioritize multiple IT support tickets with varying levels of urgency?',
                    'question_type': 'situational',
                    'order': 3
                },
                {
                    'question_text': 'What operating systems, hardware, and software are you most experienced with supporting?',
                    'question_type': 'technical',
                    'order': 4
                },
                {
                    'question_text': 'How do you stay updated with the latest technology trends and IT solutions?',
                    'question_type': 'general',
                    'order': 5
                },
            ],
            'sales_marketing': [
                {
                    'question_text': 'Describe your most successful sales achievement. What strategies did you use to close the deal?',
                    'question_type': 'behavioral',
                    'order': 1
                },
                {
                    'question_text': 'How would you approach selling our product/service to a skeptical customer who prefers a competitor?',
                    'question_type': 'situational',
                    'order': 2
                },
                {
                    'question_text': 'What digital marketing tools and platforms are you proficient in (e.g., Google Ads, Facebook Ads, email marketing)?',
                    'question_type': 'technical',
                    'order': 3
                },
                {
                    'question_text': 'Tell us about a marketing campaign you created or contributed to. What were the results?',
                    'question_type': 'behavioral',
                    'order': 4
                },
                {
                    'question_text': 'How do you handle rejection in sales, and what motivates you to keep pursuing leads?',
                    'question_type': 'general',
                    'order': 5
                },
            ],
            'general': [
                {
                    'question_text': 'Tell us about yourself and why you are interested in this position.',
                    'question_type': 'general',
                    'order': 1
                },
                {
                    'question_text': 'Describe a challenging situation at work and how you overcame it.',
                    'question_type': 'behavioral',
                    'order': 2
                },
                {
                    'question_text': 'How do you manage your time and stay productive when working remotely?',
                    'question_type': 'situational',
                    'order': 3
                },
                {
                    'question_text': 'What are your strengths and how will they benefit our company?',
                    'question_type': 'general',
                    'order': 4
                },
                {
                    'question_text': 'Where do you see yourself in 3-5 years, and what are your career goals?',
                    'question_type': 'general',
                    'order': 5
                },
            ],
        }
        
        # Filter to specific position if requested
        if position_filter:
            if position_filter not in questions_data:
                self.stdout.write(self.style.ERROR(f'Invalid position: {position_filter}'))
                self.stdout.write(f'Available positions: {", ".join(questions_data.keys())}')
                return
            positions_to_create = [position_filter]
        else:
            positions_to_create = list(questions_data.keys())
        
        created_count = 0
        skipped_count = 0
        error_count = 0
        
        for pos_code in positions_to_create:
            # Check if position type exists
            if pos_code not in position_types:
                self.stdout.write(self.style.ERROR(f'Position type "{pos_code}" not found in database'))
                error_count += 1
                continue
            
            position_type = position_types[pos_code]
            self.stdout.write(f'\nProcessing {position_type.name} questions...')
            
            for q_data in questions_data[pos_code]:
                # Check if question type exists
                q_type_code = q_data['question_type']
                if q_type_code not in question_types:
                    self.stdout.write(self.style.ERROR(f'  Question type "{q_type_code}" not found'))
                    error_count += 1
                    continue
                
                question_type = question_types[q_type_code]
                
                # Check if question already exists
                if InterviewQuestion.objects.filter(
                    question_text=q_data['question_text'],
                    position_type=position_type
                ).exists():
                    self.stdout.write(self.style.WARNING(f'  ⊘ Skipped (exists): {q_data["question_text"][:60]}...'))
                    skipped_count += 1
                    continue
                
                # Create question
                try:
                    InterviewQuestion.objects.create(
                        question_text=q_data['question_text'],
                        question_type=question_type,
                        position_type=position_type,
                        order=q_data['order'],
                        max_duration=timedelta(minutes=2),  # 2 minutes default
                        is_active=True
                    )
                    self.stdout.write(self.style.SUCCESS(f'  ✓ Created: {q_data["question_text"][:60]}...'))
                    created_count += 1
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'  ✗ Error creating question: {e}'))
                    error_count += 1
        
        self.stdout.write('\n' + '='*70)
        self.stdout.write(self.style.SUCCESS('\n✓ Summary:'))
        self.stdout.write(f'  Created: {created_count} questions')
        self.stdout.write(f'  Skipped: {skipped_count} questions (already exist)')
        if error_count > 0:
            self.stdout.write(self.style.ERROR(f'  Errors: {error_count}'))
        self.stdout.write(f'\n  Total in database: {InterviewQuestion.objects.count()} questions')
        
        # Show breakdown by position
        self.stdout.write('\n  Breakdown by position:')
        for pos_code, pos_type in position_types.items():
            count = InterviewQuestion.objects.filter(position_type=pos_type).count()
            self.stdout.write(f'    • {pos_type.name}: {count} questions')
