from django.db import models


# Create your models here.
class Project(models.Model):
    name = models.CharField(max_length=255, verbose_name="Название проекта")
    description = models.TextField(verbose_name="Описание проекта")
    creator = models.ForeignKey(
        to="account.CustomUser",
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_projects",
        verbose_name="Создатель проекта",
    )
    participants = models.ManyToManyField(
        to="account.CustomUser",
        related_name="participated_projects",
        verbose_name="Участники проекта",
    )
    created_at = models.DateTimeField(
        verbose_name="Дата и время создания", auto_now_add=True
    )
    updated_at = models.DateTimeField(
        verbose_name="Дата и время обновления", auto_now=True
    )
    STATUS_CHOICES = [
        ("draft", "Черновик"),
        ("active", "В работе"),
        ("completed", "Завершён"),
        ("archived", "Архив"),
    ]
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="draft",
        verbose_name="Статус проекта",
    )
