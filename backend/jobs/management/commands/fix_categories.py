import re
from django.core.management.base import BaseCommand
from interviews.type_models import PositionType
from interviews.models import JobPosition


DEFAULT_CATEGORIES = [
    ("it_support", "IT Support"),
    ("customer_service", "Customer Service"),
    ("technical", "Technical"),
    ("admin", "Admin"),
    ("others", "Others"),
]

# keyword mapping to category codes
CATEGORY_KEYWORDS = {
    "it_support": ["IT", "HELPDESK", "TECH SUPPORT"],
    "customer_service": ["CSR", "CUSTOMER", "AGENT"],
    "technical": ["NETWORK", "ENGINEER", "DEVELOPER"],
    "admin": ["ADMIN", "CLERK", "ASSISTANT"],
}


class Command(BaseCommand):
    help = "Ensure job categories exist and assign JobPositions to categories"

    def handle(self, *args, **options):
        # 1. Ensure default categories exist
        cat_map = {}
        for code, name in DEFAULT_CATEGORIES:
            obj, created = PositionType.objects.get_or_create(code=code, defaults={"name": name, "description": name})
            cat_map[code] = obj
            self.stdout.write(f"{'CREATED' if created else 'EXISTS  '} category {code} -> {name}")

        # 2. Assign each JobPosition
        report_rows = []
        for position in JobPosition.objects.all():
            assigned = None
            name_upper = (position.name or "").upper()
            for cat_code, keywords in CATEGORY_KEYWORDS.items():
                if any(keyword in name_upper for keyword in keywords):
                    assigned = cat_code
                    break
            if not assigned:
                assigned = "others"

            position.category = cat_map.get(assigned)
            position.save(update_fields=["category"])
            report_rows.append((position.name, position.code, position.category.name if position.category else "None"))

        # 4. Print verification table
        self.stdout.write("\nVerification:")
        self.stdout.write("Position Name | Code | Category Assigned")
        self.stdout.write("-" * 60)
        for name, code, cat in report_rows:
            self.stdout.write(f"{name} | {code} | {cat}")

        self.stdout.write(self.style.SUCCESS("Category fix complete."))
