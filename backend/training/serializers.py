from rest_framework import serializers
from .models import TrainingModule, TrainingSession, TrainingResponse

class TrainingModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingModule
        fields = '__all__'

class TrainingResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingResponse
        fields = ['id', 'question_text', 'video_file', 'transcript', 'ai_feedback', 'scores', 'created_at']
        read_only_fields = ['transcript', 'ai_feedback', 'scores', 'created_at']

class TrainingSessionSerializer(serializers.ModelSerializer):
    module_name = serializers.CharField(source='module.name', read_only=True)
    responses = TrainingResponseSerializer(many=True, read_only=True)
    
    class Meta:
        model = TrainingSession
        fields = ['id', 'applicant', 'module', 'module_name', 'status', 'created_at', 'completed_at', 'responses']
        read_only_fields = ['created_at', 'completed_at', 'responses']
