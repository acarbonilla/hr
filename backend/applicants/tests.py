from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta

from .models import Applicant, ApplicantDocument


class ApplicantModelTest(TestCase):
    """Test cases for Applicant model"""
    
    def setUp(self):
        """Set up test data"""
        self.applicant = Applicant.objects.create(
            first_name="John",
            last_name="Doe",
            email="john.doe@example.com",
            phone="1234567890",
            application_source="online",
            status="pending"
        )
    
    def test_applicant_creation(self):
        """Test that applicant is created correctly"""
        self.assertEqual(self.applicant.first_name, "John")
        self.assertEqual(self.applicant.last_name, "Doe")
        self.assertEqual(self.applicant.email, "john.doe@example.com")
        self.assertEqual(self.applicant.status, "pending")
        self.assertIsNone(self.applicant.reapplication_date)
    
    def test_applicant_full_name(self):
        """Test full_name property"""
        self.assertEqual(self.applicant.full_name, "John Doe")
    
    def test_applicant_str(self):
        """Test string representation"""
        expected = "John Doe - john.doe@example.com"
        self.assertEqual(str(self.applicant), expected)
    
    def test_email_uniqueness(self):
        """Test that email must be unique"""
        with self.assertRaises(Exception):
            Applicant.objects.create(
                first_name="Jane",
                last_name="Doe",
                email="john.doe@example.com",  # Duplicate email
                phone="0987654321",
                application_source="walk_in"
            )
    
    def test_status_choices(self):
        """Test valid status choices"""
        valid_statuses = ['pending', 'in_review', 'passed', 'failed']
        for status_val in valid_statuses:
            self.applicant.status = status_val
            self.applicant.save()
            self.assertEqual(self.applicant.status, status_val)


class ApplicantAPITest(APITestCase):
    """Test cases for Applicant API endpoints"""
    
    def setUp(self):
        """Set up test client and data"""
        self.client = APIClient()
        self.applicants_url = reverse('applicant-list')
        
        self.valid_applicant_data = {
            'first_name': 'Jane',
            'last_name': 'Smith',
            'email': 'jane.smith@example.com',
            'phone': '9876543210',
            'application_source': 'online'
        }
        
        self.existing_applicant = Applicant.objects.create(
            first_name="Existing",
            last_name="User",
            email="existing@example.com",
            phone="1112223333",
            application_source="walk_in",
            status="pending"
        )
    
    def test_create_applicant_success(self):
        """Test POST /api/applicants/ - Create new applicant"""
        response = self.client.post(
            self.applicants_url,
            self.valid_applicant_data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('applicant', response.data)
        self.assertEqual(response.data['applicant']['first_name'], 'Jane')
        self.assertEqual(response.data['applicant']['last_name'], 'Smith')
        self.assertEqual(response.data['applicant']['email'], 'jane.smith@example.com')
        self.assertEqual(response.data['applicant']['status'], 'pending')
        self.assertIsNone(response.data['applicant'].get('reapplication_date'))
        
        # Verify in database
        self.assertTrue(
            Applicant.objects.filter(email='jane.smith@example.com').exists()
        )
    
    def test_create_applicant_duplicate_email(self):
        """Test POST /api/applicants/ - Fail with duplicate email"""
        duplicate_data = self.valid_applicant_data.copy()
        duplicate_data['email'] = 'existing@example.com'
        
        response = self.client.post(
            self.applicants_url,
            duplicate_data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)
    
    def test_create_applicant_missing_fields(self):
        """Test POST /api/applicants/ - Fail with missing required fields"""
        incomplete_data = {
            'first_name': 'Test',
            'email': 'test@example.com'
            # Missing: last_name, phone, application_source
        }
        
        response = self.client.post(
            self.applicants_url,
            incomplete_data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_list_applicants(self):
        """Test GET /api/applicants/ - List all applicants"""
        response = self.client.get(self.applicants_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
    
    def test_retrieve_applicant(self):
        """Test GET /api/applicants/{id}/ - Get applicant details"""
        url = reverse('applicant-detail', args=[self.existing_applicant.id])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'existing@example.com')
        self.assertEqual(response.data['full_name'], 'Existing User')
    
    def test_update_applicant_status_to_passed(self):
        """Test PATCH /api/applicants/{id}/ - Update status to passed"""
        url = reverse('applicant-detail', args=[self.existing_applicant.id])
        
        update_data = {
            'status': 'passed'
        }
        
        response = self.client.patch(url, update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'passed')
        
        # Verify in database
        self.existing_applicant.refresh_from_db()
        self.assertEqual(self.existing_applicant.status, 'passed')
        self.assertIsNone(self.existing_applicant.reapplication_date)
    
    def test_update_applicant_status_to_failed(self):
        """Test PATCH /api/applicants/{id}/ - Update status to failed with reapplication date"""
        url = reverse('applicant-detail', args=[self.existing_applicant.id])
        
        expected_reapply_date = date.today() + relativedelta(months=1)
        
        update_data = {
            'status': 'failed',
            'reapplication_date': expected_reapply_date.isoformat()
        }
        
        response = self.client.patch(url, update_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'failed')
        self.assertIsNotNone(response.data['reapplication_date'])
        
        # Verify in database
        self.existing_applicant.refresh_from_db()
        self.assertEqual(self.existing_applicant.status, 'failed')
        self.assertIsNotNone(self.existing_applicant.reapplication_date)
    
    def test_filter_applicants_by_status(self):
        """Test GET /api/applicants/?status=pending - Filter by status"""
        # Create applicants with different statuses
        Applicant.objects.create(
            first_name="Passed",
            last_name="Applicant",
            email="passed@example.com",
            phone="5551234567",
            application_source="online",
            status="passed"
        )
        
        response = self.client.get(f"{self.applicants_url}?status=pending")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Response might be paginated or a list
        data = response.data if isinstance(response.data, list) else response.data.get('results', [])
        # Verify all returned applicants have pending status
        for applicant in data:
            self.assertEqual(applicant['status'], 'pending')
    
    def test_reapplication_logic(self):
        """Test reapplication date logic after failure"""
        # Set applicant to failed with reapplication date
        future_date = date.today() + timedelta(days=30)
        self.existing_applicant.status = 'failed'
        self.existing_applicant.reapplication_date = future_date
        self.existing_applicant.save()
        
        # Verify reapplication date is set
        self.assertEqual(self.existing_applicant.reapplication_date, future_date)
        
        # After passing, reapplication date should be cleared
        self.existing_applicant.status = 'passed'
        self.existing_applicant.reapplication_date = None
        self.existing_applicant.save()
        
        self.assertIsNone(self.existing_applicant.reapplication_date)


class ApplicantDocumentTest(TestCase):
    """Test cases for ApplicantDocument model"""
    
    def setUp(self):
        """Set up test data"""
        self.applicant = Applicant.objects.create(
            first_name="Document",
            last_name="Test",
            email="doctest@example.com",
            phone="1234567890",
            application_source="online"
        )
    
    def test_create_document(self):
        """Test creating an applicant document"""
        document = ApplicantDocument.objects.create(
            applicant=self.applicant,
            document_type='resume',
            file_path='resumes/test_resume.pdf'
        )
        
        self.assertEqual(document.applicant, self.applicant)
        self.assertEqual(document.document_type, 'resume')
        self.assertIn('test_resume.pdf', str(document.file_path))
    
    def test_applicant_has_multiple_documents(self):
        """Test that applicant can have multiple documents"""
        ApplicantDocument.objects.create(
            applicant=self.applicant,
            document_type='resume',
            file_path='resumes/resume.pdf'
        )
        ApplicantDocument.objects.create(
            applicant=self.applicant,
            document_type='cover_letter',
            file_path='cover_letters/cover.pdf'
        )
        
        self.assertEqual(self.applicant.documents.count(), 2)
