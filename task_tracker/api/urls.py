from django.contrib import admin
from django.urls import path, include
from .views import ProjectList, TasksList
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [  #
    path("project/create", ProjectList.as_view()),
    path("project/remove/<int:project_id>", ProjectList.as_view()),
    path("project/update/<int:project_id>", ProjectList.as_view()),
    path("task/create", TasksList.as_view()),
    path("task/remove/<int:task_id>", TasksList.as_view()),
    path("task/update/<int:task_id>", TasksList.as_view()),
    path("task/remove-executor/<int:task_id>/<int:user_id>", TasksList.as_view()),
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "schema/swagger-ui/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
]
