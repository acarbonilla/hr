from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.utils import timezone

from applicants.models import Applicant
from interviews.models import Interview, InterviewQuestion, VideoResponse
from interviews.type_models import PositionType, QuestionType
from results.models import InterviewResult


class Command(BaseCommand):
    help = "Create test applicants with failed and review interview outcomes."

    def handle(self, *args, **options):
        position_type = self._get_position_type()
        question_type = self._get_question_type()
        questions = self._get_questions(position_type, question_type)

        scenarios = [
            {
                "first_name": "Test Applicant",
                "last_name": "Failed",
                "email": "test_failed@applicant.dev",
                "final_score": 35.0,
                "video_scores": [30.0, 40.0],
                "competency_labels": ["communication", "troubleshooting"],
            },
            {
                "first_name": "Test Applicant",
                "last_name": "Review",
                "email": "test_review@applicant.dev",
                "final_score": 65.0,
                "video_scores": [62.0, 68.0],
                "competency_labels": ["troubleshooting", "technical_reasoning"],
            },
        ]

        for scenario in scenarios:
            applicant = self._get_or_create_applicant(scenario)
            interview = self._get_or_create_interview(applicant, position_type)
            self._ensure_video_responses(interview, questions, scenario["video_scores"])
            self._get_or_create_result(applicant, interview, scenario["final_score"])

            self.stdout.write(
                self.style.SUCCESS(
                    f"Prepared applicant {applicant.email} with interview {interview.id} and score {scenario['final_score']}."
                )
            )

    def _get_position_type(self):
        position_type = PositionType.objects.filter(code="network").first()
        if position_type:
            return position_type
        position_type = PositionType.objects.filter(is_active=True).order_by("order", "name").first()
        if position_type:
            return position_type
        return PositionType.objects.create(
            code="network",
            name="Network",
            description="Network interview test category",
            is_active=True,
        )

    def _get_question_type(self):
        question_type = QuestionType.objects.filter(is_active=True).order_by("order", "name").first()
        if question_type:
            return question_type
        return QuestionType.objects.create(
            code="technical",
            name="Technical",
            description="Technical interview questions",
            is_active=True,
        )

    def _get_questions(self, position_type, question_type):
        prompts = [
            "Describe how you approach diagnosing a connectivity issue.",
            "Explain a recent technical issue you resolved and your reasoning.",
        ]
        questions = []
        for index, prompt in enumerate(prompts, start=1):
            question, _ = InterviewQuestion.objects.get_or_create(
                question_text=prompt,
                position_type=position_type,
                question_type=question_type,
                defaults={
                    "category": position_type,
                    "competency": "communication" if index == 1 else "troubleshooting",
                    "order": index,
                    "is_active": True,
                },
            )
            if question.category_id is None:
                question.category = position_type
                question.save(update_fields=["category"])
            questions.append(question)
        return questions

    def _get_or_create_applicant(self, scenario):
        applicant, _ = Applicant.objects.get_or_create(
            email=scenario["email"],
            defaults={
                "first_name": scenario["first_name"],
                "last_name": scenario["last_name"],
                "phone": "09171234567",
                "application_source": "online",
                "status": "in_review",
            },
        )
        updates = {}
        if applicant.first_name != scenario["first_name"]:
            updates["first_name"] = scenario["first_name"]
        if applicant.last_name != scenario["last_name"]:
            updates["last_name"] = scenario["last_name"]
        if applicant.status != "in_review":
            updates["status"] = "in_review"
        if updates:
            for key, value in updates.items():
                setattr(applicant, key, value)
            applicant.save(update_fields=list(updates.keys()))
        return applicant

    def _get_or_create_interview(self, applicant, position_type):
        interview = Interview.objects.filter(applicant=applicant, position_type=position_type).order_by("-created_at").first()
        if interview:
            return interview
        now = timezone.now()
        interview = Interview.objects.create(
            applicant=applicant,
            interview_type="initial_ai",
            position_type=position_type,
            status="completed",
            submission_date=now,
            completed_at=now,
        )
        applicant.interview_completed = True
        applicant.save(update_fields=["interview_completed"])
        return interview

    def _ensure_video_responses(self, interview, questions, scores):
        existing = VideoResponse.objects.filter(interview=interview).count()
        if existing:
            return
        for question, score in zip(questions, scores):
            content = ContentFile(b"test-video-content", name=f"test_video_{interview.id}_{question.id}.txt")
            VideoResponse.objects.create(
                interview=interview,
                question=question,
                video_file_path=content,
                duration=timezone.timedelta(minutes=1),
                status="analyzed",
                transcript="Test transcript for interview review.",
                ai_score=score,
                sentiment=20.0,
            )

    def _get_or_create_result(self, applicant, interview, final_score):
        result, created = InterviewResult.objects.get_or_create(
            interview=interview,
            defaults={
                "applicant": applicant,
                "final_score": final_score,
                "passed": final_score >= 70,
            },
        )
        if not created:
            updates = {}
            if result.final_score != final_score:
                updates["final_score"] = final_score
            passed_value = final_score >= 70
            if result.passed != passed_value:
                updates["passed"] = passed_value
            if updates:
                for key, value in updates.items():
                    setattr(result, key, value)
                result.save(update_fields=list(updates.keys()))
