from django.contrib import admin
from django.urls import path, include
import projects.views as views

app_name = "projects"

urlpatterns = [
    path("", views.main, name="list"),
    path("detail/<int:project_id>/", views.detail, name="detail"),
    path(
        "add_participant/<int:project_id>/",
        views.add_participant,
        name="add_participant",
    ),
    path(
        "remove_participant/<int:project_id>/",
        views.remove_participant,
        name="remove_participant",
    ),
]
