from django.shortcuts import render, get_object_or_404
from django.db.models import Q
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
import json
from .models import Project


# Create your views here.
@login_required
def main(request):
    projects = Project.objects.filter(
        Q(creator=request.user.id) | Q(participants=request.user.id)
    ).distinct()
    return render(request, "projects/main.html", context={"projects": projects})


@login_required
def detail(request, project_id):
    project = get_object_or_404(Project, id=project_id)
    return render(request, "projects/details.html", context={"project": project})


@login_required
def add_participant(request, project_id):
    """Добавление участника в проект"""
    project = get_object_or_404(Project, id=project_id)
    if request.method == "POST":
        data = json.loads(request.body)
        user_id = data.get("user_id")
        if user_id:
            from account.models import CustomUser

            user = get_object_or_404(CustomUser, id=user_id)
            project.participants.add(user)
            project.save()
            return JsonResponse(
                {
                    "success": True,
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "last_name": user.last_name,
                    },
                }
            )
        return JsonResponse(
            {"success": False, "error": "User ID не указан"}, status=400
        )
    return JsonResponse(
        {"success": False, "error": "Неверный метод запроса"}, status=405
    )


@login_required
def remove_participant(request, project_id):
    """Удаление участника из проекта"""
    project = get_object_or_404(Project, id=project_id)
    if request.method == "POST":
        data = json.loads(request.body)
        user_id = data.get("user_id")
        if user_id:
            from account.models import CustomUser

            user = get_object_or_404(CustomUser, id=user_id)
            project.participants.remove(user)
            project.save()
            return JsonResponse({"success": True})
        return JsonResponse(
            {"success": False, "error": "User ID не указан"}, status=400
        )
    return JsonResponse(
        {"success": False, "error": "Неверный метод запроса"}, status=405
    )
