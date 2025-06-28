from django.contrib import admin
from .models import Project

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'owner', 'created_at', 'is_deleted']
    list_filter = ['is_deleted', 'created_at', 'owner']
    search_fields = ['title', 'description']
    readonly_fields = ['created_at', 'updated_at']
