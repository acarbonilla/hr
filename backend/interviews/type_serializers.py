from rest_framework import serializers
from .type_models import PositionType, QuestionType


class PositionTypeSerializer(serializers.ModelSerializer):
    """Serializer for PositionType model"""
    
    class Meta:
        model = PositionType
        fields = [
            'id', 'code', 'name', 'description', 'address', 'employment_type', 'salary',
            'key_responsibilities', 'required_skills', 'qualifications',
            'is_active', 'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def validate_code(self, value):
        """Ensure code is lowercase and uses underscores"""
        return value.lower().replace(' ', '_').replace('-', '_')


class QuestionTypeSerializer(serializers.ModelSerializer):
    """Serializer for QuestionType model"""
    
    class Meta:
        model = QuestionType
        fields = ['id', 'code', 'name', 'description', 'is_active', 'order', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def validate_code(self, value):
        """Ensure code is lowercase and uses underscores"""
        return value.lower().replace(' ', '_').replace('-', '_')
