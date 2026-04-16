from django.db import models

# Create your models here.
class Comment(models.Model):
    text = models.TextField(verbose_name="Текст комментария")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата и время создания")
    creator = models.ForeignKey("account.CustomUser", on_delete=models.SET_NULL, null=True, related_name="created_commentaries", verbose_name="Создатель комментария")
    task = models.ForeignKey("tasks.Task", on_delete=models.CASCADE, related_name="commentaries", verbose_name="Задача")


class Task(models.Model):
    name = models.CharField(max_length=255, verbose_name="Название задачи")
    description = models.TextField(verbose_name="Описание задачи")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата и время создания")
    creator = models.ForeignKey("account.CustomUser", on_delete=models.SET_NULL, null=True, related_name="created_tasks", verbose_name="Создатель задачи")
    executor = models.ManyToManyField("account.CustomUser", related_name="executed_tasks", verbose_name="Исполнитель")
    STATUS_CHOICES = [
        ('in_progress', 'В работе'),
        ('review', 'На проверке'),
        ('done', 'Выполнена'),
        ('cancelled', 'Отменена'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new', verbose_name="Статус задачи")
    priority = models.IntegerField(verbose_name="Приоритет", default=10000)
    deadline = models.DateTimeField(verbose_name="Дедлайн", null=True)
