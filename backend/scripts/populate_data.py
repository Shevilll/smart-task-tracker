#!/usr/bin/env python
import os
import sys
import django
from datetime import datetime, timedelta
from django.utils import timezone

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'task_tracker.settings')
django.setup()

from accounts.models import User
from projects.models import Project
from tasks.models import Task

def create_sample_data():
    # Create users
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@example.com',
            'role': 'admin',
            'first_name': 'Admin',
            'last_name': 'User'
        }
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        print("Created admin user")
    
    contributor1, created = User.objects.get_or_create(
        username='john_doe',
        defaults={
            'email': 'john@example.com',
            'role': 'contributor',
            'first_name': 'John',
            'last_name': 'Doe'
        }
    )
    if created:
        contributor1.set_password('john123')
        contributor1.save()
        print("Created contributor: john_doe")
    
    contributor2, created = User.objects.get_or_create(
        username='jane_smith',
        defaults={
            'email': 'jane@example.com',
            'role': 'contributor',
            'first_name': 'Jane',
            'last_name': 'Smith'
        }
    )
    if created:
        contributor2.set_password('jane123')
        contributor2.save()
        print("Created contributor: jane_smith")
    
    # Create projects
    project1, created = Project.objects.get_or_create(
        title='E-commerce Website',
        defaults={
            'description': 'Building a modern e-commerce platform with React and Django',
            'owner': admin_user
        }
    )
    if created:
        print("Created project: E-commerce Website")
    
    project2, created = Project.objects.get_or_create(
        title='Mobile App Development',
        defaults={
            'description': 'Developing a cross-platform mobile application',
            'owner': admin_user
        }
    )
    if created:
        print("Created project: Mobile App Development")
    
    # Create tasks
    now = timezone.now()
    
    tasks_data = [
        {
            'title': 'Setup Authentication System',
            'description': 'Implement JWT-based authentication for the application',
            'status': 'in_progress',
            'due_date': now + timedelta(days=2),
            'project': project1,
            'assigned_to': contributor1
        },
        {
            'title': 'Design Database Schema',
            'description': 'Create comprehensive database schema for the e-commerce platform',
            'status': 'done',
            'due_date': now - timedelta(days=1),
            'project': project1,
            'assigned_to': contributor2
        },
        {
            'title': 'Implement Product Catalog',
            'description': 'Build product listing and detail pages',
            'status': 'todo',
            'due_date': now + timedelta(days=5),
            'project': project1,
            'assigned_to': contributor1
        },
        {
            'title': 'Setup CI/CD Pipeline',
            'description': 'Configure automated testing and deployment',
            'status': 'todo',
            'due_date': now - timedelta(days=2),  # Overdue
            'project': project1,
            'assigned_to': contributor2
        },
        {
            'title': 'Mobile UI Design',
            'description': 'Create responsive UI components for mobile app',
            'status': 'in_progress',
            'due_date': now + timedelta(hours=30),  # Due soon
            'project': project2,
            'assigned_to': contributor1
        },
        {
            'title': 'API Integration',
            'description': 'Integrate mobile app with backend APIs',
            'status': 'done',
            'due_date': now - timedelta(hours=12),  # Recently completed
            'project': project2,
            'assigned_to': contributor2
        }
    ]
    
    for task_data in tasks_data:
        task, created = Task.objects.get_or_create(
            title=task_data['title'],
            project=task_data['project'],
            defaults=task_data
        )
        if created:
            print(f"Created task: {task.title}")
    
    print("\nSample data created successfully!")
    print("\nLogin credentials:")
    print("Admin - Username: admin, Password: admin123")
    print("Contributor 1 - Username: john_doe, Password: john123")
    print("Contributor 2 - Username: jane_smith, Password: jane123")

if __name__ == '__main__':
    create_sample_data()
