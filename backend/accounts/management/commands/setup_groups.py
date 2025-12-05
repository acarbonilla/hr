"""
Django management command to set up user groups and permissions
Usage: python manage.py setup_groups
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from accounts.models import User
from applicants.models import Applicant, ApplicantDocument
from interviews.models import Interview, InterviewQuestion, VideoResponse, AIAnalysis
from results.models import InterviewResult
from monitoring.models import TokenUsage, DailyTokenSummary


class Command(BaseCommand):
    help = 'Create user groups and assign permissions'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🔧 Setting up user groups and permissions...'))
        
        # ============================================
        # 1. HR RECRUITER GROUP
        # ============================================
        hr_recruiter, created = Group.objects.get_or_create(name='HR Recruiter')
        if created:
            self.stdout.write(self.style.SUCCESS('✅ Created "HR Recruiter" group'))
        
        hr_recruiter_permissions = [
            # Applicants - View and review
            ('view_applicant', Applicant),
            ('view_applicantdocument', ApplicantDocument),
            
            # Interviews - View and process
            ('view_interview', Interview),
            ('view_videoresponse', VideoResponse),
            ('view_aianalysis', AIAnalysis),
            
            # Results - View and create decisions
            ('view_interviewresult', InterviewResult),
            ('add_interviewresult', InterviewResult),
            ('change_interviewresult', InterviewResult),
            
            # Questions - View only
            ('view_interviewquestion', InterviewQuestion),
        ]
        
        self._assign_permissions(hr_recruiter, hr_recruiter_permissions)
        self.stdout.write(f'   Assigned {len(hr_recruiter_permissions)} permissions')
        
        # ============================================
        # 2. HR MANAGER GROUP
        # ============================================
        hr_manager, created = Group.objects.get_or_create(name='HR Manager')
        if created:
            self.stdout.write(self.style.SUCCESS('✅ Created "HR Manager" group'))
        
        hr_manager_permissions = [
            # Everything HR Recruiter has
            *hr_recruiter_permissions,
            
            # Additional: Manage users
            ('view_user', User),
            ('add_user', User),
            ('change_user', User),
            
            # Questions - Full management
            ('add_interviewquestion', InterviewQuestion),
            ('change_interviewquestion', InterviewQuestion),
            ('delete_interviewquestion', InterviewQuestion),
            
            # Results - Delete capability
            ('delete_interviewresult', InterviewResult),
            
            # Analytics access (implicit through group check)
            # Monitoring dashboard access
            ('view_tokenusage', TokenUsage),
            ('view_dailytokensummary', DailyTokenSummary),
        ]
        
        self._assign_permissions(hr_manager, hr_manager_permissions)
        self.stdout.write(f'   Assigned {len(hr_manager_permissions)} permissions')
        
        # ============================================
        # 3. IT SUPPORT GROUP
        # ============================================
        it_support, created = Group.objects.get_or_create(name='IT Support')
        if created:
            self.stdout.write(self.style.SUCCESS('✅ Created "IT Support" group'))
        
        it_support_permissions = [
            # Token monitoring - Full access
            ('view_tokenusage', TokenUsage),
            ('view_dailytokensummary', DailyTokenSummary),
            
            # User management
            ('view_user', User),
            ('add_user', User),
            ('change_user', User),
            
            # System monitoring (view only)
            ('view_interview', Interview),
            ('view_applicant', Applicant),
        ]
        
        self._assign_permissions(it_support, it_support_permissions)
        self.stdout.write(f'   Assigned {len(it_support_permissions)} permissions')
        
        # ============================================
        # 4. APPLICANT GROUP (Future: Self-service portal)
        # ============================================
        applicant_group, created = Group.objects.get_or_create(name='Applicant')
        if created:
            self.stdout.write(self.style.SUCCESS('✅ Created "Applicant" group'))
        
        applicant_permissions = [
            # View own data only (enforced in views)
            ('view_applicant', Applicant),
            ('change_applicant', Applicant),  # Own profile only
            ('view_interview', Interview),  # Own interviews only
        ]
        
        self._assign_permissions(applicant_group, applicant_permissions)
        self.stdout.write(f'   Assigned {len(applicant_permissions)} permissions')
        
        # ============================================
        # Summary
        # ============================================
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS('✅ Groups and permissions setup complete!'))
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write('')
        self.stdout.write('📋 Groups created:')
        self.stdout.write(f'   1. HR Recruiter - Review interviews, make decisions')
        self.stdout.write(f'   2. HR Manager - Full HR access + user management')
        self.stdout.write(f'   3. IT Support - Token monitoring + system access')
        self.stdout.write(f'   4. Applicant - Self-service portal (future)')
        self.stdout.write('')
        self.stdout.write('🔧 Next steps:')
        self.stdout.write('   1. Assign users to groups via Django admin')
        self.stdout.write('   2. Or use: python manage.py assign_user_group <username> <group>')
        self.stdout.write('')
    
    def _assign_permissions(self, group, permissions_list):
        """Helper to assign permissions to a group"""
        group.permissions.clear()  # Clear existing
        
        for codename, model in permissions_list:
            try:
                content_type = ContentType.objects.get_for_model(model)
                permission = Permission.objects.get(
                    codename=codename,
                    content_type=content_type
                )
                group.permissions.add(permission)
            except Permission.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(f'   ⚠️  Permission not found: {codename} for {model.__name__}')
                )
