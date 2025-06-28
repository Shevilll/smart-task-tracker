from rest_framework import serializers
from .models import ActivityLog
from tasks.serializers import TaskSerializer
from accounts.serializers import UserSerializer

class ActivityLogSerializer(serializers.ModelSerializer):
    task = TaskSerializer(read_only=True)
    previous_assignee = UserSerializer(read_only=True)
    updated_by = UserSerializer(read_only=True)
    
    class Meta:
        model = ActivityLog
        fields = [
            'id', 'task', 'previous_assignee', 'previous_status', 
            'previous_due_date', 'updated_at', 'updated_by'
        ]
