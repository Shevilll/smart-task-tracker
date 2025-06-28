from django.db import models
from django.conf import settings
from tasks.models import Task

class ActivityLog(models.Model):
    task = models.OneToOneField(Task, on_delete=models.CASCADE, related_name='activity_log')
    previous_assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='previous_assignments'
    )
    previous_status = models.CharField(max_length=20, blank=True)
    previous_due_date = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='activity_updates'
    )
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Activity log for {self.task.title}"
