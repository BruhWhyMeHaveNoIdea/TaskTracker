from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from .serializers import ProjectSerializer, TaskSerializer
from projects.models import Project
from tasks.models import Task
from django.shortcuts import get_object_or_404
from account.models import CustomUser

# Create your views here.
class ProjectList(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        data = request.data.copy()
        participants_usernames = data.pop('participants', '').split()
        
        if participants_usernames:
            participants = CustomUser.objects.filter(username__in=participants_usernames)
            if len(participants) == 0:
                return Response({'participants': ['Не найдены участники с указанными именами']}, status=400)
        
        serializer = ProjectSerializer(data=data)
        if serializer.is_valid():
            project = serializer.save(creator=request.user)
            
            project.participants.add(request.user)
            
            if participants_usernames:
                project.participants.add(*participants)
            
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
    def delete(self, request, pk=None):
        if pk == None:
            return Response(status=404)
        instance = get_object_or_404(Project, pk=pk)
        instance.delete()
        return Response(status=204)


class TasksList(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        data = request.data.copy()
        executors_usernames = data.pop('executors', '').split()
        deadline = data.pop('deadline', None)
        
        if deadline and deadline.strip():
            data['deadline'] = deadline
        
        serializer = TaskSerializer(data=data)
        if serializer.is_valid():
            if not executors_usernames:
                return Response({'executors': ['Исполнители обязательны']}, status=400)
            
            
            executors = CustomUser.objects.filter(username__in=executors_usernames)
            if len(executors) == 0:
                return Response({'executors': ['Не найдены исполнители с указанными именами']}, status=400)
            if len(executors) != len(executors_usernames):
                return Response({'executors': ['Некоторые исполнители не найдены']}, status=400)
            task = serializer.save(creator=request.user)
            task.executor.add(*executors)
            
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
    def delete(self, request, pk=None):
        if pk == None:
            return Response(status=404)
        instance = get_object_or_404(Task, pk=pk)
        instance.delete()
        return Response(status=204)