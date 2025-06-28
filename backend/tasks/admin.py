from django.contrib import admin
from .models import Task

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'assigned_to', 'status', 'due_date', 'created_at', 'is_deleted']
    list_filter = ['status', 'is_deleted', 'created_at', 'due_date', 'project']
    search_fields = ['title', 'description']
    readonly_fields = ['created_at', 'updated_at']
