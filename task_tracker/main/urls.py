from django.contrib import admin
from django.urls import path, include
import main.views as views

urlpatterns = [
    path("", views.main),
]