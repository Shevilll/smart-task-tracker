from django.contrib import admin
from .models import ActivityLog

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ['task', 'previous_assignee', 'previous_status', 'previous_due_date', 'updated_at', 'updated_by']
    list_filter = ['previous_status', 'updated_at']
    search_fields = ['task__title', 'task__description']
    readonly_fields = ['updated_at']
