from django.contrib import admin
from django.urls import path, include
import tasks.views as views

app_name = 'tasks'

urlpatterns = [
    path("", views.main, name='list'),
    path("detail/<int:task_id>/", views.detail, name='detail'),
    path("add_comment/<int:task_id>/", views.add_comment, name="add_comment")
]