from django.contrib import admin
from django.urls import path, include
import account.views as views
from django.contrib.auth.views import LoginView, LogoutView

urlpatterns = [
    path("home/", views.index),
    path("login/", LoginView.as_view(template_name="account/login.html"), name="login"),
    path("registration/", views.registration, name="registration"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("api/user/search/", views.search_user, name="search_user"),
]
