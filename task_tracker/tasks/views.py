from django.shortcuts import render, get_object_or_404, redirect
from .models import Task
from projects.models import Project
from django.db.models import Q
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from account.models import CustomUser
import json


# Create your views here.
@login_required
def main(request):
    tasks = Task.objects.filter(
        Q(executor=request.user.id)
        | Q(creator=request.user.id)
        | Q(project__participants=request.user.id)
    ).distinct().order_by('created_at')
    projects = Project.objects.filter(Q(participants=request.user)).distinct()
    return render(
        request, "tasks/main.html", context={"tasks": tasks, "projects": projects}
    )


@login_required
def detail(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    comments = task.commentaries.all().order_by("-created_at")
    return render(
        request, "tasks/details.html", context={"task": task, "comments": comments}
    )


@login_required
def add_comment(request, task_id):
    if request.method == "POST":
        task = get_object_or_404(Task, id=task_id)
        text = request.POST.get("text")
        if text:
            task.commentaries.create(text=text, creator=request.user)
    return redirect("tasks:detail", task_id=task_id)


@login_required
def remove_task(request, task_id):
    """Удаление задачи (только создатель)"""
    task = get_object_or_404(Task, id=task_id)
    if task.creator != request.user:
        return JsonResponse(
            {"success": False, "error": "Только создатель задачи может её удалить"},
            status=403,
        )
    task.delete()
    return JsonResponse({"success": True, "redirect": "/tasks/"})


@login_required
def change_status(request, task_id):
    """Смена статуса задачи"""
    task = get_object_or_404(Task, id=task_id)
    if request.method == "POST":
        data = json.loads(request.body)
        new_status = data.get("status")
        valid_statuses = [choice[0] for choice in Task.STATUS_CHOICES]
        if new_status in valid_statuses:
            task.status = new_status
            task.save()
            return JsonResponse(
                {"success": True, "new_status": task.get_status_display()}
            )
        return JsonResponse(
            {"success": False, "error": "Невалидный статус"}, status=400
        )
    return JsonResponse(
        {"success": False, "error": "Неверный метод запроса"}, status=405
    )


@login_required
def add_executor(request, task_id):
    """Добавление исполнителя к задаче"""
    task = get_object_or_404(Task, id=task_id)
    if request.method == "POST":
        data = json.loads(request.body)
        user_id = data.get("user_id")
        if user_id:

            user = get_object_or_404(CustomUser, id=user_id)
            task.executor.add(user)
            task.save()
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
def remove_executor(request, task_id):
    """Удаление исполнителя из задачи"""
    task = get_object_or_404(Task, id=task_id)
    if request.method == "POST":
        data = json.loads(request.body)
        user_id = data.get("user_id")
        if user_id:

            user = get_object_or_404(CustomUser, id=user_id)
            task.executor.remove(user)
            task.save()
            return JsonResponse({"success": True})
        return JsonResponse(
            {"success": False, "error": "User ID не указан"}, status=400
        )
    return JsonResponse(
        {"success": False, "error": "Неверный метод запроса"}, status=405
    )


@login_required
def change_deadline(request, task_id):
    """Смена дедлайна задачи"""
    task = get_object_or_404(Task, id=task_id)
    if request.method == "POST":
        data = json.loads(request.body)
        deadline_str = data.get("deadline")
        
        if not deadline_str:
            return JsonResponse(
                {"success": False, "error": "Дедлайн не указан"}, status=400
            )
        
        try:
            from datetime import datetime, timezone
            # Парсим дату в формате ISO (YYYY-MM-DDTHH:MM)
            deadline = datetime.fromisoformat(deadline_str)
            
            # Проверяем, что дедлайн больше текущего момента
            now = datetime.now()
            if deadline <= now:
                return JsonResponse(
                    {"success": False, "error": "Дедлайн должен быть больше текущего времени"}, 
                    status=400
                )
            
            task.deadline = deadline
            task.save()
            return JsonResponse({
                "success": True, 
                "deadline": deadline.strftime("%d.%m.%Y, %H:%M")
            })
        except ValueError:
            return JsonResponse(
                {"success": False, "error": "Неверный формат даты"}, status=400
            )
    return JsonResponse(
        {"success": False, "error": "Неверный метод запроса"}, status=405
    )


@login_required
def change_priority(request, task_id):
    """Смена приоритета задачи"""
    task = get_object_or_404(Task, id=task_id)
    if request.method == "POST":
        data = json.loads(request.body)
        priority = data.get("priority")
        
        if priority is None:
            return JsonResponse(
                {"success": False, "error": "Приоритет не указан"}, status=400
            )
        
        try:
            priority = int(priority)
            if priority < 0:
                return JsonResponse(
                    {"success": False, "error": "Приоритет должен быть неотрицательным числом"}, 
                    status=400
                )
            
            task.priority = priority
            task.save()
            return JsonResponse({
                "success": True, 
                "priority": priority
            })
        except (ValueError, TypeError):
            return JsonResponse(
                {"success": False, "error": "Приоритет должен быть числом"}, status=400
            )
    return JsonResponse(
        {"success": False, "error": "Неверный метод запроса"}, status=405
    )
