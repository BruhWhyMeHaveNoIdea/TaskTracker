from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .forms import CustomUserCreationForm, CustomUserChangeForm
from django.contrib.auth import login
from django.http import JsonResponse
from django.db.models import Q
from .models import CustomUser


# Create your views here.
@login_required
def index(request):
    return render(request, "account/home.html")


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
