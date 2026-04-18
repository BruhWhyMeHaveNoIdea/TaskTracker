from django.shortcuts import render, get_object_or_404, redirect
from .models import Task
from projects.models import Project
from django.db.models import Q
from django.contrib.auth.decorators import login_required

# Create your views here.
@login_required
def main(request):
    tasks = Task.objects.filter(Q(executor = request.user.id) | Q(creator = request.user.id) | Q(projects__participants=request.user.id)).distinct()
    projects = Project.objects.filter(Q(participants = request.user)).distinct()
    print('pr', projects)
    return render(request, "tasks/main.html", context={"tasks":tasks, "projects": projects})

@login_required
def detail(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    comments = task.commentaries.all().order_by('-created_at')
    return render(request, "tasks/details.html", context={"task": task, "comments": comments})

@login_required
def add_comment(request, task_id):
    if request.method == "POST":
        task = get_object_or_404(Task, id=task_id)
        text = request.POST.get("text")
        if text:
            task.commentaries.create(text=text, creator=request.user)
    return redirect("tasks:detail", task_id=task_id)    