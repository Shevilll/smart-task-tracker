from rest_framework import serializers
from .models import Project
from accounts.serializers import UserSerializer


class ProjectSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    tasks_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id",
            "title",
            "description",
            "owner",
            "created_at",
            "updated_at",
            "tasks_count",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_tasks_count(self, obj):
        return obj.tasks.filter(is_deleted=False).count()


class ProjectCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ["title", "description"]

    def create(self, validated_data):
        # Set the owner to the current user from the request context
        validated_data["owner"] = self.context["request"].user
        return super().create(validated_data)
