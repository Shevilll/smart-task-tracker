from django.urls import path
from . import views

urlpatterns = [
    path('', views.TaskListCreateView.as_view(), name='task-list-create'),
    path('<int:pk>/', views.TaskDetailView.as_view(), name='task-detail'),
    path('export/', views.export_tasks, name='export-tasks'),
]
