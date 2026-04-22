from django.urls import path, include
import tasks.views as views

app_name = "tasks"

urlpatterns = [
    path("", views.main, name="list"),
    path("detail/<int:task_id>/", views.detail, name="detail"),
    path("add_comment/<int:task_id>/", views.add_comment, name="add_comment"),
    path("remove/<int:task_id>/", views.remove_task, name="remove_task"),
    path("change_status/<int:task_id>/", views.change_status, name="change_status"),
    path("add_executor/<int:task_id>/", views.add_executor, name="add_executor"),
    path(
        "remove_executor/<int:task_id>/", views.remove_executor, name="remove_executor"
    ),
    path("change_deadline/<int:task_id>/", views.change_deadline, name="change_deadline"),
    path("change_priority/<int:task_id>/", views.change_priority, name="change_priority"),
]
