from django.contrib import admin

from .models import Task, Comment


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ["name", "status", "priority", "created_at", "deadline", "project"]
    list_filter = ["status", "priority", "created_at", "deadline", "project"]
    search_fields = ["name", "description"]
    readonly_fields = ["created_at"]

    fieldsets = (
        (None, {"fields": ("name", "description", "project")}),
        ("Status & Priority", {"fields": ("status", "priority", "deadline")}),
        ("Participants", {"fields": ("creator", "executor")}),
        ("Timestamps", {"fields": ("created_at",), "classes": ("collapse",)}),
    )


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ["text", "creator", "task", "created_at"]
    list_filter = ["created_at", "creator", "task"]
    search_fields = ["text", "creator__username", "task__name"]
    readonly_fields = ["created_at"]
