from rest_framework import serializers
from tasks.models import Task
from projects.models import Project

class TaskSerializer(serializers.ModelSerializer):
    executors = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ['executor']

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'tasks', 'creator']