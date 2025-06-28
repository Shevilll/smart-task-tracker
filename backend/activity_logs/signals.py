from django.db.models.signals import pre_save
from django.dispatch import receiver
from tasks.models import Task
from .models import ActivityLog

@receiver(pre_save, sender=Task)
def create_activity_log(sender, instance, **kwargs):
    if instance.pk:  # Only for updates, not creation
        try:
            old_task = Task.objects.get(pk=instance.pk)
            
            # Get or create activity log for this task
            activity_log, created = ActivityLog.objects.get_or_create(
                task=instance,
                defaults={
                    'previous_assignee': old_task.assigned_to,
                    'previous_status': old_task.status,
                    'previous_due_date': old_task.due_date,
                }
            )
            
            # Update the activity log with previous values
            if not created:
                activity_log.previous_assignee = old_task.assigned_to
                activity_log.previous_status = old_task.status
                activity_log.previous_due_date = old_task.due_date
                activity_log.save()
                
        except Task.DoesNotExist:
            pass
