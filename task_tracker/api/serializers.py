from rest_framework import serializers
from tasks.models import Task
from projects.models import Project


class TaskSerializer(serializers.ModelSerializer):
    executor = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Task
        fields = "__all__"
        read_only_fields = ["created_at", "creator"]

    def get_executor(self, obj):
        return [
            {
                "id": user.id,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
            }
            for user in obj.executor.all()
        ]


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at", "creator"]
