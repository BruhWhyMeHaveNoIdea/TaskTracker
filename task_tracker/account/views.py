from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .forms import CustomUserCreationForm, CustomUserChangeForm
from django.contrib.auth import login
from django.http import JsonResponse
from django.db.models import Q
from django.utils import timezone
from .models import CustomUser


# Create your views here.
@login_required
def index(request):
    user = request.user
    executed_tasks = user.executed_tasks.all()

    stats = {
        "in_progress": executed_tasks.filter(status="in_progress").count(),
        "review": executed_tasks.filter(status="review").count(),
        "done": executed_tasks.filter(status="done").count(),
        "overdue": executed_tasks.filter(deadline__lt=timezone.now()).exclude(
            status__in=["done", "cancelled"]
        ).count(),
    }

    upcoming_tasks = (
        executed_tasks.filter(deadline__gte=timezone.now())
        .exclude(status__in=["done", "cancelled"])
        .order_by("deadline")[:5]
    )

    my_projects = user.participated_projects.all()[:4]

    return render(
        request,
        "account/home.html",
        {
            "stats": stats,
            "upcoming_tasks": upcoming_tasks,
            "my_projects": my_projects,
        },
    )


def registration(request):
    if request.method == "POST":
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect("/account/home")
    else:
        form = CustomUserCreationForm()
    return render(request, "account/registration.html", {"form": form})


@login_required
def search_user(request):
    """Поиск пользователей по username"""
    username_query = request.GET.get("username", "")
    if username_query:
        users = CustomUser.objects.filter(Q(username__icontains=username_query)).values(
            "id", "username", "first_name", "last_name"
        )[:5]
        return JsonResponse({"users": list(users)})
    return JsonResponse({"users": []})
