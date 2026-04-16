from django.shortcuts import render, get_object_or_404
from django.db.models import Q
from django.contrib.auth.decorators import login_required
from .models import Project

# Create your views here.
@login_required
def main(request):
    projects = Project.objects.filter(Q(creator = request.user.id) | Q(participants = request.user.id)).distinct()
    return render(request, "projects/main.html", context={"projects": projects})

@login_required
def detail(request, project_id):
    project = get_object_or_404(Project, id=project_id)
    return render(request, "projects/details.html", context={"project": project})