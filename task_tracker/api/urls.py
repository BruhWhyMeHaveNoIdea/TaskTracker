from django.contrib import admin
from django.urls import path, include
from .views import ProjectList, TasksList


urlpatterns = [
    path("project/create", ProjectList.as_view()),
    path("project/remove/<int:project_id>", ProjectList.as_view()),

    path("task/create", TasksList.as_view()),
    path("task/delete/<int:task_id>", TasksList.as_view()),
]