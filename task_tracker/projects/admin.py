from django.contrib import admin

from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ["name", "status", "creator", "created_at", "updated_at"]
    list_filter = ["status", "created_at", "updated_at", "creator"]
    search_fields = ["name", "description"]
    readonly_fields = ["created_at", "updated_at"]

    fieldsets = (
        (None, {"fields": ("name", "description")}),
        ("Status", {"fields": ("status",)}),
        ("Participants", {"fields": ("creator", "participants")}),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )
