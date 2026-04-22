from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from .serializers import ProjectSerializer, TaskSerializer
from projects.models import Project
from tasks.models import Task
from django.shortcuts import get_object_or_404
from account.models import CustomUser
from django.db.models import Q


# Create your views here.
class ProjectList(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProjectSerializer

    def post(self, request):
        data = request.data.copy()
        participants_usernames = data["participants"]

        if participants_usernames:
            participants = CustomUser.objects.filter(
                username__in=participants_usernames
            )
            if len(participants) == 0:
                return Response(
                    {"participants": ["Не найдены участники с указанными именами"]},
                    status=400,
                )

        serializer = ProjectSerializer(data=data)
        if serializer.is_valid():
            project = serializer.save(creator=request.user)

            project.participants.add(request.user)

            if participants_usernames:
                project.participants.add(*participants)

            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def delete(self, request, project_id=None):
        if project_id == None:
            return Response(status=404)
        instance = get_object_or_404(Project, pk=project_id)
        instance.delete()
        return Response(status=204)

    def patch(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        data = request.data.copy()

        if data.get("participants"):
            participants_usernames = data["participants"]
            participants = CustomUser.objects.filter(
                username__in=participants_usernames
            )
            participant_ids = [user.id for user in participants]
            if len(participant_ids) == 0:
                return Response(
                    {"participants": ["Не найдены участники с указанными именами"]},
                    status=400,
                )

            current_participants = project.participants.all().values_list(
                "id", flat=True
            )

            all_participant_ids = list(set(current_participants)) + participant_ids
            data["participants"] = all_participant_ids

        serializer = ProjectSerializer(project, data=data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(status=200)
        return Response(serializer.errors, status=400)


class TasksList(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TaskSerializer

    def post(self, request):
        data = request.data.copy()
        executors_usernames = data.pop("executors", "")
        deadline = data.pop("deadline", None)

        if deadline and deadline.strip():
            data["deadline"] = deadline

        serializer = TaskSerializer(data=data)
        if serializer.is_valid():
            if not executors_usernames:
                return Response({"executors": ["Исполнители обязательны"]}, status=400)

            project = Project.objects.get(id=data["project"])

            if not project.participants.filter(id=request.user.id).exists():
                project.participants.add(request.user)

            if isinstance(executors_usernames, str):
                executors_usernames = executors_usernames.split()

            executors = CustomUser.objects.filter(
                Q(username__in=executors_usernames) | Q(username=executors_usernames)
            )

            valid_executors = []
            invalid_usernames = []
            for username in executors_usernames:
                try:
                    user = CustomUser.objects.get(username=username)
                    if project.participants.filter(id=user.id).exists():
                        valid_executors.append(user)
                    else:
                        invalid_usernames.append(username)
                except CustomUser.DoesNotExist:
                    invalid_usernames.append(username)

            if len(valid_executors) == 0:
                return Response(
                    {"executors": ["Не найдены исполнители с указанными именами"]},
                    status=400,
                )

            if len(invalid_usernames) > 0:
                return Response(
                    {
                        "executors": [
                            f'Пользователь{"и" if len(invalid_usernames) > 1 else ""} {", ".join(invalid_usernames)} не являются участниками проекта'
                        ]
                    },
                    status=400,
                )

            task = serializer.save(creator=request.user)
            task.executor.add(*valid_executors)

            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk=None, task_id=None, user_id=None):
        if task_id is not None and user_id is not None:
            return self.delete_executor(request, task_id, user_id)

        if pk == None:
            return Response(status=404)
        instance = get_object_or_404(Task, pk=pk)
        instance.delete()
        return Response(status=204)

    def delete_executor(self, request, task_id, user_id):
        task = get_object_or_404(Task, id=task_id)
        user = get_object_or_404(CustomUser, id=user_id)

        if not task.executor.filter(id=user_id).exists():
            return Response(
                {"error": "Пользователь не является исполнителем этой задачи"},
                status=400,
            )

        task.executor.remove(user)
        return Response(status=204)

    def patch(self, request, task_id):
        task = get_object_or_404(Task, id=task_id)
        data = request.data.copy()

        executor_ids = None
        if data.get("executor"):
            executors_usernames = data["executor"]
            project = task.project

            if isinstance(executors_usernames, str):
                executors_usernames = executors_usernames.split()

            valid_executors = []
            invalid_usernames = []
            for username in executors_usernames:
                try:
                    user = CustomUser.objects.get(username=username)
                    if project.participants.filter(id=user.id).exists() or (
                        task.creator and user == task.creator
                    ):
                        valid_executors.append(user)
                    else:
                        invalid_usernames.append(username)
                except CustomUser.DoesNotExist:
                    invalid_usernames.append(username)

            if len(valid_executors) == 0:
                return Response(
                    {"executor": ["Не найдены исполнители с указанными именами"]},
                    status=400,
                )

            if len(invalid_usernames) > 0:
                return Response(
                    {
                        "executor": [
                            f'Пользователь{"и" if len(invalid_usernames) > 1 else ""} {", ".join(invalid_usernames)} не являются участниками проекта'
                        ]
                    },
                    status=400,
                )

            current_executors = task.executor.all().values_list("id", flat=True)
            executor_ids = list(set(current_executors)) + [
                user.id for user in valid_executors
            ]

            data.pop("executor")

        serializer = TaskSerializer(task, data=data, partial=True)

        if serializer.is_valid():
            serializer.save()
            if executor_ids:
                task.executor.set(executor_ids)
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=400)
