from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from datetime import timedelta
import json
from django.http import HttpResponse
from .models import Task
from .serializers import TaskSerializer, TaskCreateSerializer, TaskUpdateSerializer

class TaskPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        if request.user.is_admin:
            return True
        
        # Contributors can only view and update tasks assigned to them
        if request.method in ['GET', 'PATCH', 'PUT']:
            return True
        
        return False
    
    def has_object_permission(self, request, view, obj):
        if request.user.is_admin:
            return True
        
        # Contributors can only access tasks assigned to them
        return obj.assigned_to == request.user

class TaskListCreateView(generics.ListCreateAPIView):
    permission_classes = [TaskPermission]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'project', 'assigned_to']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'due_date', 'status']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = Task.objects.filter(is_deleted=False)
        if self.request.user.is_contributor:
            queryset = queryset.filter(assigned_to=self.request.user)
        return queryset
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TaskCreateSerializer
        return TaskSerializer

class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [TaskPermission]
    
    def get_queryset(self):
        queryset = Task.objects.filter(is_deleted=False)
        if self.request.user.is_contributor:
            queryset = queryset.filter(assigned_to=self.request.user)
        return queryset
    
    def get_serializer_class(self):
        if self.request.method in ['PATCH', 'PUT']:
            return TaskUpdateSerializer
        return TaskSerializer
    
    def destroy(self, request, *args, **kwargs):
        if not request.user.is_admin:
            return Response({'error': 'Only admins can delete tasks'}, status=status.HTTP_403_FORBIDDEN)
        
        instance = self.get_object()
        instance.delete()  # This will soft delete
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def export_tasks(request):
    if not request.user.is_admin:
        return Response({'error': 'Only admins can export tasks'}, status=status.HTTP_403_FORBIDDEN)
    
    now = timezone.now()
    
    # Tasks due in next 48 hours
    due_soon = Task.objects.filter(
        is_deleted=False,
        due_date__gte=now,
        due_date__lte=now + timedelta(hours=48),
        status__in=['todo', 'in_progress']
    )
    
    # Overdue tasks
    overdue = Task.objects.filter(
        is_deleted=False,
        due_date__lt=now,
        status__in=['todo', 'in_progress']
    )
    
    # Recently completed (last 24 hours)
    recently_completed = Task.objects.filter(
        is_deleted=False,
        status='done',
        updated_at__gte=now - timedelta(hours=24)
    )
    
    data = {
        'due_soon': TaskSerializer(due_soon, many=True).data,
        'overdue': TaskSerializer(overdue, many=True).data,
        'recently_completed': TaskSerializer(recently_completed, many=True).data,
        'exported_at': now.isoformat()
    }
    
    response = HttpResponse(
        json.dumps(data, indent=2),
        content_type='application/json'
    )
    response['Content-Disposition'] = f'attachment; filename="tasks_export_{now.strftime("%Y%m%d_%H%M%S")}.json"'
    
    return response
