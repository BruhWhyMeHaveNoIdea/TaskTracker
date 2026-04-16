from django.contrib import admin
from django.urls import path, include
import projects.views as views


app_name = 'projects'

urlpatterns = [
    path("", views.main, name='list'),
    path("detail/<int:project_id>/", views.detail, name='detail')
]