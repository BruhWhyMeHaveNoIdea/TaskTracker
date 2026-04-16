from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .forms import CustomUserCreationForm, CustomUserChangeForm
from django.contrib.auth import login

# Create your views here.
@login_required
def index(request):
    return render(request, 'account/home.html')



def registration(request):
    if request.method == "POST":
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('/account/home')
    else:
        form = CustomUserCreationForm()
    return render(request, 'account/registration.html', {'form': form})